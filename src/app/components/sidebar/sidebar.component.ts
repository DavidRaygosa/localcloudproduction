import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
// SERVICES
import { UserService } from '../../services/user.service';
import { PrimeNGConfig, MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
// MODELS
import { UserUpdateModel } from '../../model/userModel/user.update.model';
import { LogoDevModel } from '../../model/logoModel/logodev.model';
import { LangsModel } from '../../model/langModel/langs.model';
import { UpdatePhotoModel } from '../../model/fileModel/file.updatePhoto.model';
import { UserModel } from '../../model/userModel/user.model';
var $:any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  providers: [UserService]
})
export class SidebarComponent implements OnInit {
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
  @Input() lang:any;
  @Output() data = new EventEmitter();
  user:UserModel;
  isLoading:boolean = true;
  updatePhoto:UpdatePhotoModel;
  myfiles:any[] = [];
  editFullname:boolean = false;
  editPass:boolean = false;
  checked:any;
  langs:any = [];
  selectedLang:LangsModel;
  logos:Array<LogoDevModel> = [];
  strongRegex:string = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[!@#\$%\^\&*\)\(+=._-])";

  constructor(private _userService:UserService, private primengConfig: PrimeNGConfig, private messageService: MessageService, private _cookieService:CookieService, private router: Router) { }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- INITIAL ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  ngOnInit(): void {
    // CHECK RESPONSIVE
    this.getScreenSize();
    this.myfiles = [];
    // GET USER DATA
    this.getUser();
    this.primengConfig.ripple = true;
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- USER ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  getUser(){
    this.editFullname = false;
    this.editPass = false;
    this._userService.session(false).subscribe((res:UserModel)=>{
      this.user = {
        id: res.id,
        fullName: res.fullName,
        token: res.token,
        tokenEncrypted: res.tokenEncrypted,
        email: res.email,
        username: res.username,
        image: res.image,
        isDark: res.isDark,
        language: res.language,
        firstLogin: res.firstLogin,
        languageImage: new LangsModel('','')
      }
      this.setImage();
      this.checked = this.user.isDark;
      this.setLanguage();
      this.setLogos();
      this.isLoading = false;
      this.returnData();
    });
  }
  setImage(){
    if(this.user.image==null) this.user.image = './assets/img/defaultprofile.png';
    else this.user.image = this.user.image.dataReferences+','+this.user.image.data;
  }
  setLanguage(){
    this.langs = [];
    let flag:string;
    if(this.user.language=='Spanish'){
      flag = '../../../assets/img/mexico_flag.png';
      this.user.languageImage.lang = this.user.language;
      this.user.languageImage.image = flag;
      let lang = new LangsModel(this.user.language,flag);
      let lang2 = new LangsModel('English','../../../assets/img/usa_flag.png');
      this.langs.push(lang);
      this.langs.push(lang2);
    }
    if(this.user.language=='English'){
      flag = '../../../assets/img/usa_flag.png';
      this.user.languageImage.lang = this.user.language;
      this.user.languageImage.image = flag;
      let lang = new LangsModel(this.user.language,flag);
      let lang2 = new LangsModel('Spanish','../../../assets/img/mexico_flag.png');
      this.langs.push(lang);
      this.langs.push(lang2);
    }
  }
  closeSession(){
    this._cookieService.delete('SESSION');
    // DELETE LOCALSTORAGE
    localStorage.removeItem('keepLogin');
    setTimeout(() => {
      this.router.navigate(['/','login']);
    }, 100);
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- INFO ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  setLogos(){
    this.logos = [];
    this.logos.push(new LogoDevModel('Angular','../../../assets/img/devlogos/angular_logo.png'));
    this.logos.push(new LogoDevModel('Asp Net Core','../../../assets/img/devlogos/aspnet_logo.png'));
    this.logos.push(new LogoDevModel('Entity Framework','../../../assets/img/devlogos/entity_logo.png'));
    this.logos.push(new LogoDevModel('SQL Server','../../../assets/img/devlogos/sql_logo.png'));
    this.logos.push(new LogoDevModel('Bootstrap 5','../../../assets/img/devlogos/bootstrap_logo.png'));
    this.logos.push(new LogoDevModel('PrimeNG','../../../assets/img/devlogos/primeng_logo.png'));
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- CHANGE IMAGE ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  handleUpload(event) {
    const file = event.target.files[0];
    let extension = file.name.split('.').pop();
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let Base64Full = reader.result?.toString();
      let extSplit:any;
      let Base64:any;
      let Base64References:any;
      if(typeof Base64Full == 'string') extSplit = Base64Full.split(',');
      Base64References = extSplit[0];
      Base64 = extSplit[1];
      this.updatePhoto ={
        ObjectReference: this.user.id,
        Data: Base64,
        DataReferences: Base64References,
        Name: 'profile',
        Extension: extension
      };
      this.isLoading = true;
      this._userService.uploadImage(this.updatePhoto).subscribe(res=>this.getUser());
    };
  }
  lauchFileInput(inputFile:any){
    inputFile.click();
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- CHANGE NAME ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  edit(value:string, visible:boolean){
    if(value=='fullname') this.editFullname = true;
  }
  onSubmitFullName(form){
    let darkmode:boolean;
    if(!this.checked||this.checked.length==0) darkmode = false;
    else darkmode = true;
    let data:UserUpdateModel ={
      FullName: form.form.value.FullName,
      isDark: darkmode,
      Language: null,
      CurrentPassword: null,
      Password: null,
      firstLogin: false
    };
    this.isLoading = true;
    this._userService.updateUser(data).subscribe(res=>this.getUser());
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- CHANGE PASSWORD ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  editPassword(visible:boolean){
    this.editPass = visible;
  } 
  onSubmitPassword(form:any, currentpassword:any, password:any){
    let darkmode:boolean;
    if(!this.checked||this.checked.length==0) darkmode = false;
    else darkmode = true;
    if(password.meter.strength!='strong'||currentpassword.meter.strength!='strong') {this.ErrorMessage('Password Must Be Strong'); return false;}
    if(form.form.value.currentPassword==form.form.value.newPassword) {this.ErrorMessage('Passwords Must Not Be The Same'); return false;}
    let data:UserUpdateModel ={
      FullName: null,
      isDark: darkmode,
      Language: null,
      CurrentPassword: form.form.value.currentPassword,
      Password: form.form.value.newPassword,
      firstLogin: false
    };
    this.isLoading = true;
    this._userService.updateUser(data).subscribe((res:any)=>{
      if(res.message == undefined) this.getUser();
      else this.ErrorMessage(res.message.message);
    });
    return true;
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  ---------------------------------------------------------------------- CHANGE THEME ---------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  changeTheme(event){
    let data:UserUpdateModel ={
      FullName: null,
      isDark: event.checked,
      Language: null,
      CurrentPassword: null,
      Password: null,
      firstLogin: false
    };
    this.isLoading = true;
    this._userService.updateUser(data).subscribe((res:any)=>this.getUser());
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  ---------------------------------------------------------------------- CHANGE LANG ---------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  changeLang(){
    if(this.selectedLang.lang != this.user.language){
      let darkmode:boolean;
      if(!this.checked||this.checked.length==0) darkmode = false;
      else darkmode = true;
      let data:UserUpdateModel ={
        FullName: null,
        isDark: darkmode,
        Language: this.selectedLang.lang,
        CurrentPassword: null,
        Password: null,
        firstLogin: false
      };
      this.isLoading = true;
      this._userService.updateUser(data).subscribe((res:any)=>this.getUser());
    }
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  ------------------------------------------------------------------------ EMIT ------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  returnData(){
    this.data.emit(this.user);
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------- TOAST MESSAGES ---------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  ErrorMessage(message:string){
    this.messageService.add({severity:'error', summary:'An Error Ocurred!', detail:message, key: 'error'});
  }

}
