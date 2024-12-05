import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

interface SenhaVisivel {
  senha: boolean;
  confirmarSenha: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgxMaskDirective, FormsModule, CommonModule, ReactiveFormsModule],
  providers: [provideNgxMask()],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  public view = 1;
  public password = '';
  public confirmPassword = '';
  public email = '';
  public nome = '';
  public cpf = '';
  public rg = '';
  public sexo = '';
  public passaporte = '';
  public nacionalidade = '';
  public codigo = '';

  public formLogin!: FormGroup;
  public formCadastro!: FormGroup;
  public formRedefinicao!: FormGroup;
  public formCodigo!: FormGroup;

  senhaVisivel: SenhaVisivel = {
    senha: false,
    confirmarSenha: false
  }

  constructor(
      private service: LoginService
    , private toastr : ToastrService
    , private router : Router
    , private fb     : FormBuilder
  ) {}

  ngOnInit() {
    this.inicializarFormularios();
  }

  inicializarFormularios(): void {
    // Formulário de Login
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Formulário de Cadastro
    this.formCadastro = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      rg: ['', [Validators.required, Validators.minLength(7)]],
      sexo: ['', Validators.required],
      passaporte: ['', [Validators.required, Validators.minLength(8)]],
      nacionalidade: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    // Formulário de Redefinição de Email
    this.formRedefinicao = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Formulário de Código de Verificação
    this.formCodigo = this.fb.group({
      codigo: ['', Validators.required]
    });
  }

  login() {
    this.view = 1;
    this.password = '';
    this.confirmPassword = '';
    this.email = '';
    this.nome = '';
    this.cpf = '';
    this.rg = '';
    this.sexo = '';
    this.passaporte = '';
    this.nacionalidade = '';
  }

  cadastro() {
    this.view = 2;
    this.password = '';
    this.email = '';
  }

  redefir() {
    this.view = 3;
  }

  SenhaForte(senha: string, criterios?: { comprimentoMinimo?: number, temMaiusculas?: boolean, temMinusculas?: boolean, temNumeros?: boolean, temCaracteresEspeciais?: boolean }): boolean {
    const criteriosPadrao = {
      comprimentoMinimo: 8,
      temMaiusculas: true,
      temMinusculas: true,
      temNumeros: true,
      temCaracteresEspeciais: true
    };

    const { comprimentoMinimo, temMaiusculas, temMinusculas, temNumeros } = { ...criteriosPadrao, ...criterios };

    const padraoMaiusculas = temMaiusculas ? /[A-Z]/ : /.*/;
    const padraoMinusculas = temMinusculas ? /[a-z]/ : /.*/;
    const padraoNumeros = temNumeros ? /[0-9]/ : /.*/;

    return senha.length >= comprimentoMinimo &&
           padraoMaiusculas.test(senha) &&
           padraoMinusculas.test(senha) &&
           padraoNumeros.test(senha);
  }

  verificarSenhasIguais(): boolean {
    const senha = this.formCadastro.get('password')?.value;
    const confirmarSenha = this.formCadastro.get('confirmPassword')?.value;
    return senha === confirmarSenha;
  }

  enviarEmail(): void {
    if (this.formRedefinicao.valid) {
      this.service.enviarEmail(this.formRedefinicao.value.email).subscribe({
        next: (res: any) => {
          if (res.blOk === true) {
            this.toastr.success(res.message, 'SUCESSO:');
            this.view = 4;
          } else {
            this.toastr.error(res.message, 'ERRO:');
          }
        },
        error: (error) => {
          console.error('Error during email sending:', error);
          this.toastr.warning('Ocorreu um erro durante o envio do email. Por favor, tente novamente!', 'ATENÇÃO:');
        }
      });
    }
  }
  
  entrar(): void {
    if (this.formLogin.valid) {
      const data = { email: this.formLogin.value.email, password: this.formLogin.value.password }
      this.service.entrar(data).subscribe({
        next: (res: any) => {
          if (res.blOk === true) {
            const user = res.user[0];
            localStorage.setItem('id', user.idusuario);
            localStorage.setItem('nome', user.nome);
            localStorage.setItem('logado', "true");
            localStorage.setItem('tipo_user', user.tpusuario);
            localStorage.setItem('idHost', "0");
            localStorage.setItem('verPerfil', "0");
            localStorage.setItem('verIntercambio', "0");
            this.toastr.success(res.message, 'SUCESSO:', {positionClass: 'toast-center-center'});
            this.router.navigate(['/home']);
          } else {
            this.toastr.error(res.message, 'ERRO:', {positionClass: 'toast-center-center'});
          }
        },
        error: (error) => {
          console.error('Error during login:', error);
          this.toastr.warning('Ocorreu um erro durante o login. Por favor, tente novamente!', 'ATENÇÃO:', {positionClass: 'toast-center-center'});
        }
      });
    }
  }

  cadastrar(): void {
    if (this.formCadastro.valid) {
      const data = this.formCadastro.value;
      this.service.cadastrar(data).subscribe({
        next: (res: any) => {
          if (res.success === true) {
            this.toastr.success(res.message, 'SUCESSO:', {positionClass: 'toast-center-center'});
            this.view = 1;
          } else {
            this.toastr.error(res.message, 'ERRO:', {positionClass: 'toast-center-center'});
          }
        },
        error: (error) => {
          console.error('Error during registration:', error);
          this.toastr.warning('Ocorreu um erro durante o cadastro. Por favor, tente novamente!', 'ATENÇÃO:', {positionClass: 'toast-center-center'});
        }
      });
    } else { this.toastr.warning("Existem campos que não foram preenchidos corretamente.", "ATENÇÃO:", {positionClass: 'toast-center-center'}); }
  }

  confirmarCodigo(): void {
    if (this.formCodigo.valid) {
      this.service.enviarEmail(this.formCodigo.value.codigo).subscribe({
        next: (res: any) => {
          if (res.blOk === true) {
            this.toastr.success(res.message, 'SUCESSO:', {positionClass: 'toast-center-center'});
            this.view = 5;
          } else {
            this.toastr.error(res.message, 'ERRO:', {positionClass: 'toast-center-center'});
          }
        },
        error: (error) => {
          console.error('Error during code confirmation:', error);
          this.toastr.warning('Ocorreu um erro durante a confirmação do código. Por favor, tente novamente!', 'ATENÇÃO:');
        }
      });
    }
  }

  mudarSenhaVisivel(campo: keyof SenhaVisivel){
    this.senhaVisivel[campo] = !this.senhaVisivel[campo];
  }

  salvarSenha(): void {
    if (this.formCadastro.get('password')?.valid && this.formCadastro.get('confirmPassword')?.valid) {
      this.service.enviarEmail(this.formCadastro.value.password).subscribe({
        next: (res: any) => {
          if (res.blOk === true) {
            this.toastr.success(res.message, 'SUCESSO:');
            this.view = 1;
          } else {
            this.toastr.error(res.message, 'ERRO:');
          }
        },
        error: (error) => {
          console.error('Error during password saving:', error);
          this.toastr.warning('Ocorreu um erro durante a redefinição de senha. Por favor, tente novamente!', 'ATENÇÃO:');
        }
      });
    }
  }
}
