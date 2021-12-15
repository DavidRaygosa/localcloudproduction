import { Component, OnInit, HostListener, Inject, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { DiskService } from '../../services/disk.service';
// SERVICES
import { FileService } from '../../services/file.service';
import { PrinterService } from '../../services/printer.service';
// MODELS
import { UpdatePhotoModel } from '../../model/fileModel/file.updatePhoto.model';
import { DiskModel } from '../../model/diskModel/disk.model';
import { FolderCreateModel } from '../../model/folderModel/folder.create.model';
import { FolderListModel } from '../../model/folderModel/folder.list.model';
import { UploadFileModel } from '../../model/fileModel/file.upload.model';
import { UploadFileDropModel } from '../../model/fileModel/file.uploaddrop.model';
import { UserModel } from '../../model/userModel/user.model';
import { UploadTempFileModel } from '../../model/fileModel/file.upload.temp';
import { UserUpdateModel } from '../../model/userModel/user.update.model';
// LANG
import EnglishLang from '../../../assets/langs/lang-english.json';
import SpanishLang from '../../../assets/langs/lang-spanish.json';
// JWT
import jwt_decode from 'jwt-decode';
// COOKIE SERVICE
import { CookieService } from 'ngx-cookie-service';
// PRIMENG
import {MenuItem, MessageService} from 'primeng/api';
// MOMENTJS
import * as moment from 'moment';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [MessageService, UserService, DiskService, FileService, PrinterService]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  innerWidth: any;
  responsive:boolean = false;
  @HostListener('window:resize', ['$event'])
  getScreenSize() {
        this.innerWidth = window.innerWidth;
        if(this.innerWidth<992){
          this.responsive = true;
        }
        if(this.innerWidth>=992) {
          this.responsive = false;
        }

  }
  loading:boolean = true;
  public isCompleteLoaded:boolean = false;
  refreshBread:boolean = false;
  forbidden: Array<string> = ['*','.','"','/','[',']',':',';','|',',','\\'];
  cookie: string;
  token:any;
  items: MenuItem[] = [];
  Breadcrumb: MenuItem[] = [];
  path: any = "";
  home!: MenuItem;
  profileImage:string;
  uploadFile:UpdatePhotoModel[];
  displayMaximizable:boolean = false;
  displayMaximizableFolder:boolean = false;
  uploadedFiles: Array<File> = [];
  rootPath: any;
  disks: any[] = [];
  diskPercentage:string;
  isCreatingFolder:boolean = false;
  data:any;
  user:UserModel;
  myfiles:any[] = [];
  sideBar:boolean = false;
  lang:any;
  globalLang:any;
  isUploading:boolean = false;
  reachMaxSize:boolean = false;
  // DROP
  isDropping:boolean = false;
  keepDropping:boolean = false;
  isLoadingfiles:boolean = false;
  isUploadingDrop:boolean = false;
  isSeveral:boolean = false;
  folderToDrop:Array<FolderCreateModel> = [];
  filesToDrop:any;
  fileDropLenght:number = 0;
  tempIDs:any;
  read:any;
  PercentageUploadedFiles: string;
  currentUploadFile:any;
  currentUploadIndex:number;
  // PRINT
  displayPrintDialog:boolean = false;
  isPrinterOffline:boolean = false;
  printersList:any;
  selectedPrinter:any;
  fileToPrint:any;
  isNotPrintable:boolean = false;
  isPrinting:boolean = false;

  @HostListener("window:dragover", ["$event"]) onDragOverListener(evt) {
    evt.preventDefault()
    this.isDropping = true;
  }
  @HostListener("window:dragleave", ["$event"]) onDragLeaveListener(evt) {
    evt.preventDefault()
    setTimeout(() => {
      if(!this.keepDropping) this.isDropping = false;
    },10);
    
  }

  constructor(@Inject(DOCUMENT) private document: Document, private _cookieService:CookieService, private router: Router, private messageService: MessageService, private _userService:UserService, private _diskService:DiskService, private _fileService:FileService, private _printerService:PrinterService) { 
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- INITIAL ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

  ngOnInit(): void {
  }
  ngAfterViewInit(){
    // CHECK RESPONSIVE
    this.getScreenSize();
    // GET TOKEN
    this.getToken();
    // GET DISCS
    this.getDiscs()
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- BREADCRUMB ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

  breadcrumbClicked(breadcrumb:MenuItem){
    this.Breadcrumb.splice(Number(breadcrumb.tabindex));
    this.path = '';
    if(breadcrumb.tabindex!='0'){
      this.Breadcrumb.forEach((Bread)=>{
        this.path = this.path+'$path$'+Bread.label;
      });
    }
    this.getData(this.getDisk(),this.path, false, 'refreshData');
  }
  addBreadItem(item:string){
    let addBreadCrumb:MenuItem = {
      label: item,
      tabindex: (this.Breadcrumb.length+1).toString()
    };
    this.Breadcrumb.push(addBreadCrumb);
    this.refreshBreadCrumb();
  }
  refreshBreadCrumb(){
    this.refreshBread = true;
    setTimeout(() => {
      this.refreshBread = false;
    }, 1);
  }
  setMenubar(){
    this.items = [
      {
          label: this.lang.menubar.file.label,
          icon: 'pi pi-fw pi-file',
          items: [
            {label: this.lang.menubar.file.itemslabel, icon: 'pi pi-fw pi-upload', command: () => this.showFileModal(true)}
          ]
      },
      {
          label: this.lang.menubar.folder.label,
          icon: 'pi pi-fw pi-folder',
          items: [
              {label: this.lang.menubar.folder.itemslabel, icon: 'pi pi-fw pi-plus', command: () => this.showFolderModal(true)}
          ]
      },
      {
          label: this.lang.menubar.Printer.label,
          icon: 'pi pi-fw pi-print',
          items: [
              {label: this.lang.menubar.Printer.itemslabel, icon: 'pi pi-fw pi-print', command: () => this.printDirect()}
          ]
      }
    ];
    this.home = {label: this.lang.breadcrumb.home, icon: 'pi pi-home', tabindex: '0'};
  }
  loadStyle(styleName: string) {
    const head = this.document.getElementsByTagName('head')[0];
    const style = this.document.createElement('link');
    style.id = 'client-theme';
    style.rel = 'stylesheet';
    style.href = `${styleName}`;
    head.appendChild(style);
    style.onload = () => {
      this.isCompleteLoaded = true;
    };
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- SESSION ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

  getToken(){
    this.cookie = this._cookieService.get('SESSION');
    this.token = this.getDecodedAccessToken(this.cookie);
  }
  setSession(isFirstload:boolean){
    if(isFirstload){
      this._userService.session(this.getKeepLogin()).subscribe((res:UserModel)=>{
        this.user = res;
        if(res.image==null) this.profileImage = './assets/img/defaultprofile.png';
        else this.profileImage = res.image.dataReferences+','+res.image.data;
        this.setLang(res.language, false);
        this.setTheme(res.isDark);
        if(res.firstLogin){
          let data:UserUpdateModel ={
            FullName: this.user.fullName,
            isDark: res.isDark,
            Language: null,
            CurrentPassword: null,
            Password: null,
            firstLogin: false
          };
          this._userService.updateUser(data).subscribe(res=>this.firstLogin());
        }else this.isWelcomeBack();
      });
    }
    else if(!isFirstload) this.loading = false;
  }
  firstLogin(){
    this.loading = false;
    this.registerMessage(this.lang.successmessage.firslogin);
  }
  setTheme(isDark:boolean){
    if(isDark) {this.loadStyle('theme-dark.css');localStorage.setItem('isDark', JSON.stringify(true));}
    if(!isDark) {this.loadStyle('theme.css');localStorage.removeItem('isDark');}
  }

  setLang(lang:string, isRefresh:boolean){
    if(isRefresh) this.loading = true;
    if(lang=='English') {this.lang = EnglishLang.dashboard;this.globalLang = EnglishLang};
    if(lang=='Spanish') {this.lang = SpanishLang.dashboard;this.globalLang = SpanishLang};
    if(isRefresh) this.loading = false;
    this.setMenubar();
  }
  isWelcomeBack(){
    setTimeout(() => {
      if(JSON.parse(localStorage.getItem("showWelcome"))) this.loginMessage(this.token.nameid, this.lang.successmessage.welcomeback);
      this.loading = false;
    }, 1);
  }
  getKeepLogin(){
    var keeplogin = JSON.parse(localStorage.getItem("keepLogin"));
    if(keeplogin==null) return false;
    return true;
  }
  getDecodedAccessToken(token: string): any {
    try{
        return jwt_decode(token);
    }
    catch(Error){
        return null;
    }
  }
  closeSession(){
    this._cookieService.deleteAll('SESSION');
    // DELETE LOCALSTORAGE
    localStorage.removeItem('keepLogin');
    this.router.navigate(['/','login']);
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- DATA ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

  getData(root:string, path:string, isFirstload:boolean, action:string){
    this.loading = true;
    this.isUploading = false;
    let data ={
      root: root,
      path: path
    };
    this._fileService.getFiles(data).subscribe(res=>{
      this.data=res;
      if(isFirstload || action=="getSession") this.setSession(isFirstload);
      if(action=='refreshData') this.loading = false;
    });
  }
  updateData(event:UserModel){
    if(this.user.language!=event.language) {this.user.language = event.language;this.setLang(event.language, true);}
    if(this.user.isDark!=event.isDark) {this.user.isDark = event.isDark;this.setTheme(event.isDark);}
    if(event.image!=this.profileImage){
      this.profileImage = event.image;
      this.getData(this.getDisk(),this.path, false, 'getSession');
    }
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------- INFO DISK ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

  setPath(path:any){
    if(path=='') this.getData(this.getDisk(),this.path, false, 'refreshData');
    else{
      this.path = this.path+path;
      path =  path.split("$path$");
      this.addBreadItem(path[1]);
      this.getData(this.getDisk(),this.path, false, 'refreshData');
    }
  }
  getDisk(){
    let disk:string;
    if(this.rootPath==undefined) disk = 'C:'
    else{
      let root = this.rootPath.driverName.split("\\"); 
      disk = root[0];
    }
    return disk;
  }
  getDiscs(){
    this._diskService.disklist().subscribe((res:DiskModel[])=>{
      res.forEach((disk)=>{
        if(disk.volumeLabel!='') disk.tag = disk.driverName+" - "+disk.volumeLabel;
        else disk.tag = disk.driverName+" - Local";
      });
      this.disks = res;
      this.diskPercentage = Math.abs((((this.disks[0].freeSpace/this.disks[0].totalSize)*100)-100)).toString();
      this.getData('C:','', true, '');
    });
  }
  changeRootPath(){
    this.diskPercentage = Math.abs((((this.rootPath.freeSpace/this.rootPath.totalSize)*100)-100)).toString();
    this.Breadcrumb = [];
    this.path = '';
    this.getData(this.getDisk(),this.path, false, 'refreshData');
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------- PRINTER ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

  printDirect(){
    this.printersList = [];
    this.fileToPrint = [];
    this._printerService.getPrinter().subscribe(res=>{
      this.printersList = res;
      this.fileToPrint.name = this.lang.printdialog.choosebtn;
      this.isNotPrintable = false;
      this.displayPrintDialog = true;
    });
  }
  print(confirmation:boolean=false){
    this.isPrinterOffline = false;
    if(!confirmation){
        if(this.selectedPrinter!=undefined){
          if(this.selectedPrinter.printerStatus=='Offline') this.isPrinterOffline = true;
          else this.sendFileToPrint();
        }else this.sendFileToPrint();
    }else this.sendFileToPrint();
  }
  lauchFileInput(inputFile:any){
    inputFile.click();
  }
  filetoprint(file:any){
    this.fileToPrint = file.target.files[0];
    this.isNotPrintable = false;
    let fileExtension = this.fileToPrint.name.split(".");
    let extension:string = '';
    fileExtension.forEach((element, index)=>{
      if((index+1)==fileExtension.length) extension = element;
    });
    if(!this.isPrintable(extension.toUpperCase())) this.isNotPrintable = true;
  }
  sendFileToPrint(){
    if(this.fileToPrint.lastModified!=undefined){
      let fileExtension = this.fileToPrint.name.split(".");
      let extension:string = '';
      fileExtension.forEach((element, index)=>{
        if((index+1)==fileExtension.length) extension = element;
      });
      console.log(extension.toUpperCase());
      if(this.isPrintable(fileExtension[1].toUpperCase())){
        this.isPrinting = true;
        let formData = new FormData();
        let file = this.fileToPrint;
        let fileNameSplit = file.name.split(".");
        formData.append('files', file, '$Temp$FilePrint.'+fileNameSplit[1]);
        let temp:UploadTempFileModel ={
          root: this.getDisk(),
          path: this.path,
          files: formData
        };
        // UPLOAD TEMP FILE
        this._fileService.uploadFileTemp(temp).subscribe(res=>{
          let IDFileTemp = res;
          let currentPath = this.path.replaceAll('$path$', '\\');
          let fullpath = this.getDisk()+'\\Cloud'+currentPath+'\\'+'$Temp$FilePrint.'+fileNameSplit[1];
          let printerName;
          if(this.selectedPrinter!=null) printerName = this.selectedPrinter.printerName;
          else printerName = this.printersList[0].printerName;
          let data ={
            printer: printerName,
            filePath: fullpath
          };
          this._printerService.print(data).subscribe(res=>{
            setTimeout(() => {
              this._fileService.deleteFile(IDFileTemp[0]).subscribe(res=>{this.displayPrintDialog=false;this.isPrinting = false;this.loginMessage(this.lang.successmessage.printing,'')});
            }, 5000);
          });
        });
      }
    }
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  ------------------------------------------------------------------------- DROP ------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

  onDrop(event) {
    this.isLoadingfiles = true;
    this.folderToDrop = [];
    this.filesToDrop = [];
    this.filesToDrop.path = [];
    this.filesToDrop.file = [];
    let folders = [];
    let items = event.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let entry = item.webkitGetAsEntry();
      if (entry.isFile) {
          new Promise(() => {
              entry.file( 
                  file => {
                      let split = entry.fullPath.split(entry.name); 
                      let replace = split[0].replaceAll('/','$path$');
                      let fullpath = replace+entry.name;
                      this.filesToDrop.path.push(fullpath);
                      this.filesToDrop.file.push(file);
                  }
              )});
      }else if (entry.isDirectory) {
        let directoryReader = entry.createReader();
        let fullpath = entry.fullPath.replaceAll('\\','$path$');
        let data:FolderCreateModel ={
          root: this.getDisk(),
          foldername: entry.name,
          path: this.path + fullpath,
          isDrop: true
        }
        this.folderToDrop.push(data);
        folders.push(directoryReader);
      }
      if((i+1)==items.length) this.loadDirFiles(folders);
    }
    this.buildDropData();
    event.preventDefault();
  }
  loadDirFiles(directoryReader:any){
    let fileList = [];
    directoryReader.forEach(Dir=>{
      let read = Dir.readEntries.bind(Dir, function(files) {
        if(files.length==0){
          setTimeout(() => {
            clearInterval(interval);
          }, 1000);
        }
        for(let i = 0; i < files.length; i++){
          fileList.push(files[i]);
        }
      });
      read();
      let interval = setInterval(() => {
        read();
      },200); // 154GB (STEAM) - 100 // 435GB (DISK F:) - 200
    });   
    setTimeout(() => {
      let folders = [];
      fileList.forEach((file, i) =>{
        if(file.isFile){
          file.file( 
            inFile => {
              let split = file.fullPath.split(file.name); 
              let replace = split[0].replaceAll('/','$path$');
              let fullpath = replace+file.name;
              this.filesToDrop.path.push(fullpath);
              this.filesToDrop.file.push(inFile);
          });
        }if(file.isDirectory){
          let fullpath = file.fullPath.replaceAll('/','$path$');
          let data:FolderCreateModel ={
            root: this.getDisk(),
            foldername: file.name,
            path: this.path + fullpath,
            isDrop: true
          }
          let directoryReaderF = file.createReader();
          this.folderToDrop.push(data);
          folders.push(directoryReaderF);
        }if((i+1)==fileList.length) this.loadDirFiles(folders);
      });
    }, 1500);
  }
  buildDropData(){
    let index:number = this.filesToDrop.file.length;
    this.fileDropLenght = 0;
    this.isSeveral = false;
    setTimeout(() => {
      this.isSeveral = true;
    }, 5000);
    let interval = setInterval(() => {
      if(index==this.filesToDrop.file.length){
        clearInterval(interval);
        let folderlist:FolderListModel = new FolderListModel(this.folderToDrop);
        this._diskService.createFolder(folderlist).subscribe((res:any)=>{
          if(res.message == undefined){
            if(Number(this.diskPercentage)<=95){
              // BUILD DATA TO UPLOAD
              this.uploadedFiles = [];
              let lastmodifed:Array<string> = [];
              let paths:Array<string> = [];
              for(let i=0; i<this.filesToDrop.file.length; i++) {
                this.uploadedFiles.push(this.filesToDrop.file[i]);
                lastmodifed.push(moment(this.filesToDrop.file[i].lastModifiedDate).format());
                paths.push(this.path+this.filesToDrop.path[i])
              }
              // CREATE TEMP FILE PATHS (IN SERVER)
              let pathsTemp = JSON.stringify(paths);
              let lastTemp = JSON.stringify(lastmodifed);
              let PathsBlob = new Blob([pathsTemp], { type: 'text/plain' });
              let LastBlob  = new Blob([lastTemp], { type: 'text/plain' });
              let PathsTemp = this.blobToFile(PathsBlob, "$Temp$Paths.txt");
              let LastModified = this.blobToFile(LastBlob, "$Temp$LastModified.txt");
              let formDataTemp = new FormData();
              formDataTemp.append('files', PathsTemp, PathsTemp.name);
              formDataTemp.append('files', LastModified, LastModified.name);
              let temp:UploadTempFileModel ={
                root: this.getDisk(),
                path: this.path,
                files: formDataTemp
              };
              // CHECK FILE SIZE
              let totalSize:number = 0;
              this.uploadedFiles.forEach(file=>{
                totalSize = totalSize+file.size;
              });
              if(totalSize>=4294967295){
                this.isDropping = false;
                this.ErrorMessage(this.lang.dialogfileupload.exceeds);
              }else{
                // UPLOAD TEMP FILE
                this._fileService.uploadFileTemp(temp).subscribe(res=>{
                  this.tempIDs = res;
                  this.uploadDrop(this.fileDropLenght);
                });
              }
            }else this.ErrorMessage(this.lang.errormessage.diskfull);
          }
          else{
            this.isDropping = false;
            this.ErrorMessage(this.lang.errormessage.folderexists);
          }
        }); 
      }
      else index = this.filesToDrop.file.length;
    }, 3000); // THIS TIME WORKS LIKE TIMEOUT
  }
  uploadDrop(index:number){
    this.currentUploadFile = this.uploadedFiles[0];
    this.currentUploadIndex = index;
    this.isUploadingDrop = true;
    if(index<this.uploadedFiles.length){
      this.uploadedFilesPorcentage(this.fileDropLenght+1);
      let formData = new FormData();
      this.currentUploadFile = this.uploadedFiles[index];
      let file = this.uploadedFiles[index];
      formData.append('files', file, file.name);
      let data:UploadFileDropModel ={
        root: this.getDisk(),
        path: this.path,
        files: formData,
        index: this.fileDropLenght
      };
      // FILE TEMPS WAS CREATED, THEN UPLOAD FILES
      this._fileService.uploadFilesDrop(data).subscribe((res:any)=>{
        this.fileDropLenght = res;
        this.uploadDrop(this.fileDropLenght);
      });
    }else{
        // DETELTE TEMP FILES
        this.tempIDs.forEach((ID)=>{
          this._fileService.deleteFile(ID).subscribe();
        });
        // WAIT 1 SEG TO DELETE TEMP FILES
        setTimeout(() => {this.isDropping=false;this.isUploadingDrop=false;this.isLoadingfiles=false;this.getData(this.getDisk(), this.path, false, 'refreshData');}, 1000);
    }
  }
  blobToFile = (theBlob: Blob, fileName:string): File => {
      var b: any = theBlob;
      //A Blob() is almost a File() - it's just missing the two properties below which we will add
      b.lastModifiedDate = new Date();
      b.name = fileName;
      //Cast to a File() type
      return <File>theBlob;
    }
  onDropOver(event){
    event.preventDefault()
    this.keepDropping = true;
  }
  onDropLeave(event){
    event.preventDefault()
    this.keepDropping = false;
  }
  uploadedFilesPorcentage(currentFilePos){
    this.PercentageUploadedFiles = ((currentFilePos/this.filesToDrop.file.length)*100).toString();
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  ------------------------------------------------------------------- UPLOAD SINGLE FILE ------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

  showFileModal(visible:boolean){
    this.displayMaximizable = visible;
  }
  onUpload(event) {
    this.isUploading = true;
    this.reachMaxSize = false;
    if(Number(this.diskPercentage)<=95){
      this.uploadedFiles = [];
      let lastmodifed:Array<string> = [];
      for (let file of event.files) {
        this.uploadedFiles.push(file);
        lastmodifed.push(moment(file.lastModifiedDate).format());
      }
      let disk= this.getDisk();
      let formData = new FormData();
      let totalSize:number = 0;
      this.uploadedFiles.forEach((file)=>{
        totalSize = totalSize+file.size;
        formData.append('files', file, file.name);
      });
      let data:UploadFileModel ={
        root: disk,
        path: this.path,
        lastmodifed: lastmodifed,
        files: formData
      };
      if(totalSize>=4294967295){this.reachMaxSize = true;this.isUploading = false;}
      else{
        this._fileService.uploadFiles(data).subscribe(res=>{
          this.myfiles = [];
          this.showFileModal(false);
          this.getData(data.root, data.path, false, 'refreshData');
        });
      }
    }
    else this.ErrorMessage(this.lang.errormessage.diskfull);
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  --------------------------------------------------------------------- CREATE FOLDER -------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

  showFolderModal(visible:boolean){
    this.displayMaximizableFolder = visible;
  }
  onSubmitFolder(dataForm, input, form){
    if(this.isFolderNameValid(dataForm, input)){
      let disk = this.getDisk();
      let data:FolderCreateModel ={
        root: disk,
        foldername: dataForm.target.folderName.value,
        path: this.path,
        isDrop: false
      }
      let folder:Array<FolderCreateModel> = [];
      folder.push(data);
      let folderlist:FolderListModel = new FolderListModel(folder);
      this._diskService.createFolder(folderlist).subscribe((res:any)=>{
        if(res.message == undefined){
          form.reset();
          this.showFolderModal(false);
          this.getData(data.root, data.path, false, 'refreshData');
        }else {input.classList.add('ng-invalid');this.ErrorMessage(this.lang.errormessage.folderexists);}
      });
    }
  }
  isFolderNameValid(dataForm, input){
    input.classList.remove('ng-invalid');
    if (!dataForm.target.folderName.value.replace(/\s/g, '').length) {
      this.ErrorMessage(this.lang.errormessage.whitspaces);
      input.classList.add('ng-invalid');
      return false;
    }
    if (this.forbidden.some(function(v) { return dataForm.target.folderName.value.indexOf(v) >= 0;})) {
      input.classList.add('ng-invalid');
      this.ErrorMessage(this.lang.errormessage.forbidden);
      return false;
    }
    return true;
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  --------------------------------------------------------------------- VALIDATORS -------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

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
  --------------------------------------------------------------------- TOAST MESSAGES -------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

  ErrorMessage(message:string){
    this.messageService.add({severity:'error', summary:this.lang.errormessage.summary, detail:message, key: 'error'});
  }
  registerMessage(message:string){
    localStorage.setItem('showWelcome', JSON.stringify(false));
    this.messageService.add({severity:'info', life:5000, summary: message});
  }
  loginMessage(userName:string, message:string) {
    localStorage.setItem('showWelcome', JSON.stringify(false));
    setTimeout(() => {this.messageService.add({severity:'info', summary: message, detail: userName});}, 100); 
  }
}