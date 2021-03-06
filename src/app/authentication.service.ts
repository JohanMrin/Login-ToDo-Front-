import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';


export interface UserDetails {
  _id: string;
  email: string;
  username: string;
  name: string;
  exp: number;
  iat: number;
}

interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  email: string;
  password?: string;
  repassword?: string;
  username?: string;
  name ?: string;
  userID ?: string;
}

@Injectable()

export class AuthenticationService {
  private token: string;



  constructor(private http: HttpClient, private router: Router) {

  }


  private saveToken(token: string): void {
    localStorage.setItem('mean-token', token);
    this.token = token;
  

  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('mean-token');
    }
    return this.token;
  }

  public getUserDetails(): UserDetails {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }


  private request(method: 'post'|'get', type: 'auth/login'|'auth/register'|'user/profile'| 'auth/update' | 'auth/reset' , user?: TokenPayload): Observable<any> {
    let base;
  
    if (method === 'post') {
      base = this.http.post(`http://localhost:3000/api/${type}`, user);
    } else {
      base = this.http.get(`/api/${type}`, { headers: { Authorization: `Bearer ${this.getToken()}` }});
    }
    console.log(base);
    const request = base.pipe(
      map((data: TokenResponse) => {

        if (data.token) {
          this.saveToken(data.token);
        }
     
        return data;
      })
    );

    return request;
  }

  
  public register(user: TokenPayload): Observable<any> {
    return this.request('post', 'auth/register', user);
  }

  public update(user: TokenPayload): Observable<any> {
    return this.request('post', 'auth/update', user);
  }

  public login(user: TokenPayload): Observable<any> {
    return this.request('post', 'auth/login', user);
  }

  public resetpassword(user: TokenPayload): Observable<any> {
    return this.request('post', 'auth/reset', user);
  }
  public profile(): Observable<any> {
    return this.request('get', 'user/profile');
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('mean-token');
    this.router.navigateByUrl('/');
    //location.reload();
  }
}
