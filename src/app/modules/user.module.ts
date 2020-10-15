import { NgModule } from '@angular/core';
import {MaterialModule} from './material.module';
import {SharedModule} from './shared.module';
import {CommonModule} from '@angular/common';
import {UserRoutingModule} from '../user.routing.module';
import {UserComponent} from '../components/user/user.component';
import {UserActionsComponent} from '../components/user-actions/user.actions.component';
import {UserSettingsComponent} from '../components/user-settings/user-settings.component';
import {UserFormComponent} from '../components/user-forms/user.form.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    UserRoutingModule
  ],
  exports: [
  ],
  declarations: [
    UserComponent,
    UserActionsComponent,
    UserSettingsComponent,
    UserFormComponent,
  ],
  entryComponents: [],
  providers: [
  ]
})



export class UserModule { }
