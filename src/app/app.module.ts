import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { ContactsModule } from './contacts/contacts.module';
import { PhoneModule } from './phone/phone.module';
import { SharedModule } from './shared/shared.module';
import { VoicemailModule } from './voicemail/voicemail.module';
import { AppComponent } from './app.component';
import { ExtensionsComponent } from './extensions/extensions.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { MenuComponent } from './menu/menu.component';
import { RecentsComponent } from './recents/recents.component';
import { SettingsComponent } from './settings/settings.component';
import { AuthInterceptor } from './shared/auth/auth-interceptor';
import { ZohoService } from './shared/integrations/zoho.service';
import { UpdateService } from './shared/services/update.service';

@NgModule({
  declarations: [
    AppComponent,
    ExtensionsComponent,
    HeaderComponent,
    LoginComponent,
    MainComponent,
    MenuComponent,
    SettingsComponent,
    RecentsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    PhoneModule,
    VoicemailModule,
    ContactsModule,
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ZohoService,
    UpdateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
