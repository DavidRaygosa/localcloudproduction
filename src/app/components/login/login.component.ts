import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
// SERVICES
import { UserService } from '../../services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import Parallax from 'parallax-js';
// MODELS
import { UserRegisterModel } from '../../model/userModel/user.register.model';
import { UserLoginModel } from '../../model/userModel/user.login.model';
import { LangsModel } from '../../model/langModel/langs.model';
// LANG
import EnglishLang from '../../../assets/langs/lang-english.json';
import SpanishLang from '../../../assets/langs/lang-spanish.json';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [UserService, CookieService, MessageService]
})

export class LoginComponent implements OnInit {

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
  isLoading:boolean = false;
  isRegistring:boolean = false;
  password:string = "";
  displayMaximizable:boolean = false;
  login:UserLoginModel = new UserLoginModel('','',false);
  newRegister:UserRegisterModel = new UserRegisterModel('','','','','','',false,'');
  strongRegex:string = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[!@#\$%\^\&*\)\(+=._-])"
  checked:boolean = false;
  isDark:any;
  lang:any;
  langs:any = [];
  selectedLang: string = 'English';
  loginDark:boolean = false;
  // DOM
  DOMregisterPassword:any;
  passwordRegisterForm:any

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- INITIAL ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  constructor(@Inject(DOCUMENT) private document: Document, private _userService:UserService, private cookieService:CookieService, private router: Router, private messageService: MessageService) {
    var keeplogin = JSON.parse(localStorage.getItem("keepLogin"));
    if(keeplogin!=null){
      this._userService.getTokenDescrypt(keeplogin).subscribe((res:any)=>{
        let token = res.message.message;
        this.cookieService.set('SESSION', token);
        this.router.navigate(['']);
      });    
    }else{
      let isDark = JSON.parse(localStorage.getItem("isDark"));
      if(isDark!=null) this.loginDark = true;
      else this.loginDark = false;
      this.isDark = this.loginDark;
      this.setTheme(this.loginDark);
      // DELETE LOCALSTORAGE
      localStorage.removeItem('showWelcome');
      // CHECK TOKEN
      this.checkToken();
      // CHECK RESPONSIVE
      this.getScreenSize();
    }
   }
  ngOnInit(): void {
    this.setLoginLang();
    this.startParallax();
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- LANG ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  setLoginLang(){
    let storageLang = JSON.parse(localStorage.getItem("lang"));
    this.langs = [];
    if(!storageLang){
      let lang = new LangsModel('English','../../../assets/img/usa_flag.png');
      this.langs.push(lang);
      let lang2 = new LangsModel('Spanish','../../../assets/img/mexico_flag.png');
      this.langs.push(lang2);
      this.lang = EnglishLang.login;
    }
    else{
      if(storageLang=='English'){
        let lang = new LangsModel('English','../../../assets/img/usa_flag.png');
        this.langs.push(lang);
        let lang2 = new LangsModel('Spanish','../../../assets/img/mexico_flag.png');
        this.langs.push(lang2);
        this.lang = EnglishLang.login;
      }
      if(storageLang=='Spanish'){
        let lang = new LangsModel('Spanish','../../../assets/img/mexico_flag.png');
        this.langs.push(lang);
        let lang2 = new LangsModel('English','../../../assets/img/usa_flag.png');
        this.langs.push(lang2);
        this.lang = SpanishLang.login;
      }
    }
  }
  changeLang(event){
    localStorage.setItem('lang', JSON.stringify(event.value.lang));
    this.setLoginLang();
    this.selectedLang = event.value.lang;
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- THEME ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  setTheme(isDark:boolean){
    if(isDark) this.loadStyle('theme-dark.css');
    if(!isDark) this.loadStyle('theme.css');
  }
  loadStyle(styleName: string) {
    const head = this.document.getElementsByTagName('head')[0];
      const style = this.document.createElement('link');
      style.id = 'client-theme';
      style.rel = 'stylesheet';
      style.href = `${styleName}`;
      head.appendChild(style);
  }
  changeTheme(event){
    if(event.checked){
      localStorage.setItem('isDark', JSON.stringify(true));
      this.setTheme(true);
    }else if(!event.checked){
      localStorage.removeItem('isDark');
      this.setTheme(false);
    }
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- PARALLAX ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  startParallax(){
		var scene = document.getElementById('scene');
		let parallaxInstance = new Parallax(scene,
			{
				relativeInput: true,
				scalarX: 40,
				scalarY: 40
			});
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- REGISTER ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  register(visible:boolean){
    this.displayMaximizable = visible;
  }
  onSubmitRegister(form:any){
    let darkmode:boolean = false;
    this.isRegistring = true;
    if(!this.isDark||this.isDark.length==0) darkmode = false;
    else darkmode = true;
    this.newRegister = {
      name: form.target.nameRegister.value,
      lastName: form.target.registerLastname.value,
      email: form.target.registerEmail.value,
      password: this.DOMregisterPassword,
      username: form.target.registerUsername.value,
      Language: this.selectedLang,
      isdark: darkmode,
      image: 'Default'
    };
    this._userService.register(this.newRegister).subscribe((res:any)=>{
      if(res.message == undefined) this.loginSuccess(res.token);
      else {
        if(res.message.message=="Email has been registered") this.registerFailed(this.lang.error.emailexists,res.message.message);
        if(res.message.message=="Username has been used") this.registerFailed(this.lang.error.usernameexists,res.message.message);
        if(res.message.message=="Password mut be: Strong") this.registerFailed(this.lang.error.passwordshort,res.message.message);
      }
    });
  }
  registerFailed(message:string, res:string){
    let DOMregisterEmail = document.getElementById("registerEmail") as HTMLSelectElement;
    let DOMregisterPasswordID = document.getElementById("registerPassword") as any;
    let DOMregisterUsername = document.getElementById("registerUsername") as HTMLSelectElement;
    DOMregisterEmail.classList.remove('ng-invalid');
    DOMregisterPasswordID.setAttribute("style", "border:1px solid var(--border-primary)");
    DOMregisterUsername.classList.remove('ng-invalid');
    if(res=='Email has been registered') DOMregisterEmail.classList.add('ng-invalid');
    if(res=='Password mut be: Strong') DOMregisterPasswordID.setAttribute("style", "border:1px solid var(--border-invalid)");
    if(res=='Username has been used') DOMregisterUsername.classList.add('ng-invalid');
    this.isLoading = false;
    this.isRegistring = false
    this.ErrorMessage(message);
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- LOGIN ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  onSubmit(form:any){
    this.isLoading = true;
    let remember = false;
    if(this.checked[0]) remember = true;
    this.login = {
      email:form.target.loginUser.value,
      password: form.target.loginPassword.value,
      isRemember: remember
    };
    this._userService.login(this.login).subscribe((res:any)=>{
      if(res.message==undefined){
        if(res.tokenEncrypted!="") localStorage.setItem('keepLogin', JSON.stringify(res.tokenEncrypted));
        this.loginSuccess(res.token);
      }
      else{
        if(res.message.message=='User Not Exists') this.loginFailed(this.lang.error.usernotexists,res.message.message);
        if(res.message.message=='Password not match') this.loginFailed(this.lang.error.passwordnotmatch,res.message.message);
      }
    });
  }
  loginFailed(message:string, res:string){
    let DOMloginEmail = document.getElementById("loginEmail") as HTMLSelectElement;
    let DOMloginPassword = document.getElementById("loginPassword") as HTMLSelectElement;
    DOMloginEmail.classList.remove('ng-invalid');
    DOMloginPassword.classList.remove('ng-invalid');
    if(res=='User Not Exists') DOMloginEmail.classList.add('ng-invalid');
    if(res=='Password not match') DOMloginPassword.classList.add('ng-invalid');
    this.isLoading = false;
    this.isRegistring = false
    this.ErrorMessage(message);
  }
  loginSuccess(token:any){
    this.cookieService.set('SESSION', token);
    this.isLoading = false;
    this.isRegistring = false;
    localStorage.setItem('showWelcome', JSON.stringify(true));
    setTimeout(() => {
      this.router.navigate(['']);
    }, 1);  
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  -------------------------------------------------------------------------- TOKEN ----------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  checkToken(){
    if(this.cookieService.check('SESSION')) this.router.navigate(['']);
  }

  /*----------------------------------------------------------------------------------------------------------------------------------------------------------
  ---------------------------------------------------------------------- TOAST MESSAGES -------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------------------------------------------------------------------*/
  ErrorMessage(message:string){
    this.messageService.add({severity:'error', summary:'An Error Ocurred!', detail:message});
  }
}
