import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WastePage} from './components/waste-page/waste-page';
import {Item, ItemType} from './models/item';

@Component({
  selector: 'app-root',
  imports: [WastePage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
