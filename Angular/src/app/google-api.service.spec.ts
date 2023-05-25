import { TestBed } from '@angular/core/testing';
import { OAuthService, OAuthLogger, UrlHelperService, DateTimeProvider } from 'angular-oauth2-oidc';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GoogleApiService } from './google-api.service';

fdescribe('GoogleApiService', () => {
  let service: GoogleApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OAuthService, OAuthLogger, GoogleApiService, UrlHelperService,DateTimeProvider]
    });
    service = TestBed.inject(GoogleApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
