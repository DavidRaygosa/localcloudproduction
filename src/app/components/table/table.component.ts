import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
// PRIMENG
import { Table } from 'primeng/table';
import { PrimeNGConfig } from 'primeng/api';
// SERVICES
import { UserService } from '../../services/user.service';
import { FileService } from '../../services/file.service';
import { FolderService } from '../../services/folder.service';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { PrinterService } from '../../services/printer.service';
// MODELS
import { FolderUpdateNameModel } from '../../model/folderModel/folder.update.model'; 
import { FileUpdateNameModel } from '../../model/fileModel/file.update.file.model';
import { DataFileModel } from '../../model/dataModel/data.files.model';
import { DataModel } from '../../model/dataModel/data.model';
import { PublicUserModel } from '../../model/userModel/user.public.model';
// LANG
import { registerLocaleData } from '@angular/common';
import localeEN from '@angular/common/locales/en';
import localeMX from '@angular/common/locales/es-MX';
import * as moment from 'moment';
import Hammer from 'hammerjs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [UserService, FileService, FolderService, PrinterService, MessageService, ConfirmationService]
})
export class TableComponent implements OnInit {
    innerWidth: any;
    responsive:boolean = false;
    @HostListener('window:resize', ['$event'])
    getScreenSize() {
        this.innerWidth = window.innerWidth;
        if(this.innerWidth<992){
        this.responsive = true;
        this.chunksByPage(10);
        }
        if(this.innerWidth>=992) {
        this.responsive = false;
        }
    }
  @Input() globalPath:MenuItem[] = [];
  @Input() lang:any;
  selectedFiles: DataFileModel[] = [];
  forbidden: Array<string> = ['*','.','"','/','[',']',':',';','|',',','\\'];
  users: Array<PublicUserModel> = [];
  loading: boolean;
  @Input() data:DataModel;
  tableData:DataModel;
  @Output() path = new EventEmitter();
  @ViewChild('dt') table: Table;
  displayMaximizableChangeName:boolean = false;
  isMenuContext: boolean = false;
  contextFile: any;
  displayPrintDialog:boolean = false;
  downloadingMessage:string;
  isDownloading:boolean = false;
  // PRINTER
  printersList:any;
  selectedPrinter:any;
  isPrinterOffline:boolean = false;
  isPrinting:boolean = false;
  // RESPONSIVE
  TableDataResponsive:any;
  paginationNumber: number = 0;

  constructor(private primengConfig: PrimeNGConfig, private _userService:UserService, private _fileService:FileService, private _folderService:FolderService, private _printerService:PrinterService, private messageService: MessageService, private confirmationService:ConfirmationService) {
    this.loading = true;
}

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    ------------------------------------------------------------------------ INITIAL ----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    ngOnInit(): void {
        if(this.lang.lang=='Spanish') registerLocaleData(localeMX, 'es-MX');
        if(this.lang.lang=='English') registerLocaleData(localeEN, 'en'); 
        // Get Users
        this.getUsers();
        this.primengConfig.setTranslation(this.lang.calendar_lang);
        this.primengConfig.ripple = true;
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------- USERS ----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    getUsers(){
        this._userService.allUser().subscribe((res:Array<PublicUserModel>)=>{
            res.forEach((user)=>{
                if(user.image==null) user.image = './assets/img/defaultprofile.png';
                else user.image = user.image.dataReferences+','+user.image.data;
                this.users.push(user);
            });
            this.fixData();
        });
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------- EMIT ----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    addPath(path:any){
        path = '$path$'+path;
        this.path.emit(path);
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------- TABLE ----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    fixData(){
        this.data.files.sort((val1, val2)=> {return <any>new Date(val2.fileUpdatedDate) - <any>new Date(val1.fileUpdatedDate)});
        if(this.data.files.length==0&&this.data.folders.length>=0) this.setDataToTable(this.data);
        this.data.files.forEach((file, Index)=>{
            this.users.forEach((user)=>{
                if(this.data.files[Index].fullName==user.id){
                    this.data.files[Index].fullName = user.fullName;
                    if(user.image==null) this.data.files[Index].image = './assets/img/defaultprofile.png';
                    else this.data.files[Index].image = user.image;
                }
            });
            this.data.files[Index].logo = this.getLogo(this.data.files[Index].fileType);
            if(Index==(this.data.files.length-1)) this.setDataToTable(this.data);
        });
    }
    setDataToTable(data:DataModel){
        this.tableData = data;
        this.tableData.files.map(x=>{
            x.fileUpdatedDate = moment(x.fileUpdatedDate).format("YYYY-MM-DD");
            x.fileCreatedDate = moment(x.fileCreatedDate).format("YYYY-MM-DD");
        })
        // CHECK RESPONSIVE
        this.getScreenSize();
        this.loading = false;
    }
    onDateUploaded(value) {
        this.table.filter(this.formatDate(value), 'fileUpdatedDate', 'equals')
    }
    onDateCreated(value) {
        this.table.filter(this.formatDate(value), 'fileCreatedDate', 'equals')
    }
    formatDate(date) {
        let month = date.getMonth() + 1;
        let day = date.getDate();
        if (month < 10){
            month = '0' + month;
        }
        if (day < 10){
            day = '0' + day;
        }
        return date.getFullYear() + '-' + month + '-' + day;
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------- DOWNLOAD ----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    downloadFile(ID:any, menucontext:any){
        this.hideContextMenu(menucontext);
        this.downloadingMessage = '';
        this.isDownloading = true;
        this.downloadingMessage = this.lang.downloading.initializing;
        if(this.contextFile.isFolder){
            ID = ID.replaceAll('\\','$path$');
            let root = ID.split("$path$");
            let data ={
                Path: ID,
                folderName: this.contextFile.changeName,
                root: root[0]
            };
            this.downloadingMessage = this.lang.downloading.preparing;
            this._fileService.createZip(data).subscribe(res=>{
                let ID = res[0];
                this._fileService.downloadZip(ID).subscribe((res:any)=>{
                    this.downloadingMessage = this.lang.downloading.downloading;
                    this.saveAs(res.body, data.folderName+'.zip');
                    this._fileService.deleteFile(ID).subscribe(res=>{
                        setTimeout(() => {
                            this.isDownloading = false
                        }, 100);
                    });         
                });
            });
        }
        else{
            this.downloadingMessage = this.lang.downloading.preparing;
            this._fileService.downloadFile(ID).subscribe((res:any)=>{
                this.downloadingMessage = this.lang.downloading.downloading;
                this.saveAs(res.body, this.contextFile.changeName+'.'+this.contextFile.fileType.toLowerCase());
                this.isDownloading = false;
            });
        }
    }
    saveAs(blob:any, name:string){
        saveAs(blob, name);
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------- PRINT ----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    printFile(context:any, menucontext:any){
        this.printersList = [];
        this._printerService.getPrinter().subscribe(res=>{
            this.printersList = res;
            this.hideContextMenu(menucontext);
            this.displayPrintDialog = true;
        });
    }
    print(confirmation:boolean=false){
        this.isPrinting = true;
        this.isPrinterOffline = false;
        if(!confirmation){
            if(this.selectedPrinter!=undefined){
                if(this.selectedPrinter.printerStatus=='Offline') {this.isPrinterOffline = true;this.isPrinting = false;}
                else this.sendFileToPrint();
            }else this.sendFileToPrint();
        }else this.sendFileToPrint();
    }
    sendFileToPrint(){
        let data ={
            printer: this.selectedPrinter.printerName,
            filePath: this.contextFile.fullPath
        };
        this._printerService.print(data).subscribe(res=>{this.displayPrintDialog = false;this.isPrinting = false;this.SuccessMessage(this.lang.printdialog.printing);})
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------- POPUPS ----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    popupEvent(event: Event, ID:string) {
        this.confirmationService.confirm({
          target: event.target,
          acceptLabel: this.lang.deleteconfirm.acceptLabel,
          rejectLabel: this.lang.deleteconfirm.rejectLabel,
          message: this.lang.deleteconfirm.txt,
          icon: "pi pi-exclamation-triangle",
          accept: () => this.deleteFile(ID)
        });
    }
    popupDeleteSelected(event: Event){
        this.confirmationService.confirm({
            target: event.target,
            acceptLabel: this.lang.deleteconfirm.acceptLabel,
            rejectLabel: this.lang.deleteconfirm.rejectLabel,
            message: this.lang.deleteconfirm.txt,
            icon: "pi pi-exclamation-triangle",
            accept: () => this.deleteSelectedFiles()
          });
    }
    deleteSelectedFiles(){
        this.selectedFiles.forEach((file, index)=>{
            this._fileService.deleteFile(file.fileID).subscribe(res=>{
                if((index+1)==this.selectedFiles.length) this.path.emit('');
            });
        });
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------- DELETE FILE ----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    deleteFile(ID:string){
        if(this.contextFile.isFolder){
            let data={path: ID}
            this._folderService.deteleFolder(data).subscribe(res=>this.path.emit(''));
        }
        else if(!this.contextFile.isFolder) this._fileService.deleteFile(ID).subscribe(res=>this.path.emit(''));
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------- MENU CONTEXT ----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    showContextMenu(file, event, menucontext, isFolder=false, isResponsive:boolean = false){
        this.isMenuContext = false;
        setTimeout(() => {
            this.isMenuContext = true;
            if(!isFolder){
                this.contextFile = file;
                this.contextFile.changeName = file.fileName;
                this.contextFile.isFolder = false;
                this.contextFile.isPrintable = this.isPrintable(file.fileType);
            }else this.setContextFolder(file.folderName, file.pathFolder);
            menucontext.classList.remove('d-none');
            menucontext.classList.add('d-block');
            if(!isResponsive) menucontext.setAttribute("style", "top:"+event.pageY+"px; left:"+event.pageX+"px;");
            else if(isResponsive){
                menucontext.setAttribute("style", "top:"+(event.pageY-202)+"px; left:10%;");
            }
        },1);
    }
    hideContextMenu(menucontext){
        this.isMenuContext = false;
        menucontext.classList.remove('d-block');
        menucontext.classList.add('d-none');
    }
    setContextFolder(folderName:string, folderPath:string){
        this.contextFile ={
            logo: './assets/img/folder_icon.png',
            fileName: folderName,
            image: null,
            fullPath: folderPath,
            fileID: folderPath,
            changeName: folderName,
            isPrintable: false,
            isFolder: true
        };
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    ----------------------------------------------------------------- RESPONSIVE TABLE ----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    chunksByPage(chunk:number){
        this.TableDataResponsive = this.tableData.files.reduce((resultArray, item, index) => { 
            let chunkIndex = Math.floor(index/chunk)
            if(!resultArray[chunkIndex]) {
              resultArray[chunkIndex] = [] // start a new chunk
            }
            resultArray[chunkIndex].push(item)      
            return resultArray
        }, [])
    }
    responsivePagination(event){
        this.chunksByPage(event.rows);
        this.paginationNumber = event.page;
    }
   
    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    ----------------------------------------------------------------- CHANGE NAME DIALOG ----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    showchangeFileNameModal(value, menucontext){
        if(!value) this.displayMaximizableChangeName = value;
        this.isMenuContext = false;
        if(menucontext!=null){
            menucontext.classList.remove('d-block');
            menucontext.classList.add('d-none');
            this.displayMaximizableChangeName = value;
        }
    }
    onSubmitName(event, nameFile, form){
        if(!this.contextFile.isFolder){
            let data:FileUpdateNameModel ={
                ID: this.contextFile.fileID,
                Name: event.target.changeFileName.value
            };
            this._fileService.updateFile(data).subscribe(res=>this.path.emit(''));
        }
        else{
            if(this.validNameFolder(event, nameFile)){
                nameFile.classList.remove('ng-invalid');
                let data:FolderUpdateNameModel ={
                    path: this.contextFile.fullPath,
                    folderName: event.target.changeFileName.value,
                    index: (this.globalPath.length).toString()
                };
                this._folderService.uploadFolder(data).subscribe((res:any)=>{
                    if(res.message==undefined) this.path.emit('');
                    else if(res.message.message=='Folder name exists, choose another.'){
                        nameFile.classList.add('ng-invalid');
                        this.ErrorMessage(this.lang.errormessage.folderexists);
                    }else this.path.emit('');
                });
            }
        }
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    --------------------------------------------------------------------- VALIDATORS -----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

    validNameFolder(dataForm:any ,input:any){
        input.classList.remove('ng-invalid');
        if (!dataForm.target.changeFileName.value.replace(/\s/g, '').length) {
          this.ErrorMessage(this.lang.errormessage.whitespaces);
          input.classList.add('ng-invalid');
          return false;
        }
        if (this.forbidden.some(function(v) { return dataForm.target.changeFileName.value.indexOf(v) >= 0;})) {
          input.classList.add('ng-invalid');
          this.ErrorMessage(this.lang.errormessage.forbidden);
          return false;
        }
        return true;
    }
    getLogo(type:string){
        if(type=='DOC'||type=='DOCX'||type=='DOCM'||type=='DOT'||type=='DOTX') return './assets/img/word_logo.png';
        if(type=='XLS'||type=='XLSX'||type=='XLA'||type=='XLAM'||type=='XLL'||type=='XLM'||type=='XLSM'||type=='XLT'||type=='XLTM'||type=='XLTX') return './assets/img/excel_logo.png';
        if(type=='POT'||type=='POTM'||type=='POTX'||type=='PPAM'||type=='PPS'||type=='PPSM'||type=='PPSX'||type=='PPT'||type=='PPTM'||type=='PPTX') return './assets/img/powerpoint_logo.png';
        if(type=='AAC'||type=='ADT'||type=='ADTS'||type=='AIF'||type=='AIFC'||type=='AIFF'||type=='CDA'||type=='M4A'||type=='MP3'||type=='WAV'||type=='WMA'||type=='OGG') return './assets/img/music_logo.png';
        if(type=='AVI'||type=='FLV'||type=='MP4'||type=='VOB'||type=='WMV'||type=='MOV'||type=='MPG'||type=='MPEG'||type=='OGV') return './assets/img/video_logo.png';
        if(type=='BIN'||type=='RAR'||type=='ZIP'||type=='GZ'||type=='GZIP'||type=='TAR'||type=='TGZ'||type=='XBK'||type=='NOTEBOOK'||type=='ISO'||type=='7Z') return './assets/img/rar_logo.png';
        if(type=='GIF'||type=='JPG'||type=='JPEG'||type=='PNG') return './assets/img/photo_logo.png';
        if(type=='HTM'||type=='HTML') return './assets/img/html_logo.png';
        if(type=='TXT') return './assets/img/txt_logo.png';
        if(type=='PDF') return './assets/img/pdf_logo.png';
        return './assets/img/file_logo.png';
    }
    isPrintable(type:string){
        if(type=='DOC'||type=='DOCX'||type=='DOCM'||type=='DOT'||type=='DOTX') return true;
        if(type=='XLS'||type=='XLSX'||type=='XLA'||type=='XLAM'||type=='XLL'||type=='XLM'||type=='XLSM'||type=='XLT'||type=='XLTM'||type=='XLTX') return true;
        if(type=='POT'||type=='POTM'||type=='POTX'||type=='PPAM'||type=='PPS'||type=='PPSM'||type=='PPSX'||type=='PPT'||type=='PPTM'||type=='PPTX') return true;
        if(type=='JPG'||type=='JPEG'||type=='PNG') return true;
        if(type=='TXT') return true;
        if(type=='PDF') return true;
        return false;
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------------------------
    ------------------------------------------------------------------ TOAST MESSAGE -----------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    ErrorMessage(message:string){
    this.messageService.add({severity:'error', summary:this.lang.errormessage.summary, detail:message, key: 'error'});
    }
    SuccessMessage(message:string){
        this.messageService.add({severity:'success', summary:this.lang.errormessage.summary, detail:message, key: 'success'});
    }
}