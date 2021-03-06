import {NgModule} from '@angular/core';
import {MaterialModule} from './material.module';
import {SharedModule} from './shared.module';
import {CommonModule} from '@angular/common';
import { MyTracksRoutingModule } from '../my-tracks.routing.module';
import { TracksComponent } from '../components/tracks/tracks.component';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { MyTracksProgressComponent } from '../components/tracks/progress/tracks.progress';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    MyTracksRoutingModule,
    AngularFireStorageModule
  ],
  exports: [],
  declarations: [TracksComponent, MyTracksProgressComponent],
  entryComponents: [],
  providers: []
})

export class MyTracksModule {
}
