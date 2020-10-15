import {NgModule} from '@angular/core';
import {MaterialModule} from './material.module';
import {SharedModule} from './shared.module';
import {CommonModule} from '@angular/common';
import {EventRoutingModule} from '../event.routing.module';
import {EventCardComponent} from '../components/event/event.card.component';
import {EventCardMapComponent} from '../components/event/map/event.card.map.component';
import {EventCardLapsComponent} from '../components/event/laps/event.card.laps.component';
import {EventCardToolsComponent} from '../components/event/tools/event.card.tools.component';
import {ActivityActionsComponent} from '../components/activity-actions/activity.actions.component';
import {MapActionsComponent} from '../components/event/map/map-actions/map.actions.component';
import {EventCardChartActionsComponent} from '../components/event/chart/actions/event.card.chart.actions.component';
import {EventCardDevicesComponent} from '../components/event/devices/event.card.devices.component';
import {AgmCoreModule} from '@agm/core';
import {EventHeaderComponent} from '../components/event-header/event-header.component';
import {HeaderStatsComponent} from '../components/header-stats/header-stats.component';
import {ActivitiesTogglesComponent} from '../components/event/activities-toggles/activities-toggles.component';
import {EventCardStatsTableComponent} from '../components/event/stats-table/event.card.stats-table.component';
import {EventCardStatsGridComponent} from '../components/event/stats-grid/event.card.stats-grid.component';
import {EventCardChartComponent} from '../components/event/chart/event.card.chart.component';
import {ActivityToggleComponent} from '../components/event/activity-toggle/activity-toggle.component';
import {EventIntensityZonesComponent} from '../components/event/intensity-zones/event.intensity-zones.component';
import { LapTypeIconComponent } from '../components/lap-type-icon/lap-type-icon.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    EventRoutingModule,
    AgmCoreModule
  ],
    exports: [
        EventHeaderComponent
    ],
  declarations: [
    EventCardComponent,
    EventCardMapComponent,
    EventCardStatsTableComponent,
    EventCardStatsGridComponent,
    EventCardLapsComponent,
    EventCardToolsComponent,
    EventCardChartComponent,
    EventCardChartActionsComponent,
    EventCardDevicesComponent,
    EventHeaderComponent,
    HeaderStatsComponent,
    ActivitiesTogglesComponent,
    ActivityActionsComponent,
    ActivityToggleComponent,
    MapActionsComponent,
    EventIntensityZonesComponent,
    LapTypeIconComponent,
  ],
  entryComponents: [],
})


export class EventModule {
}
