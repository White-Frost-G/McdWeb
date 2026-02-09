import { Injectable } from '@angular/core';
import { Item } from '../models/item';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

const CACHE_KEY = 'items_cache_v1';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private apiUrl = 'https://mcddatashare20260126172019-afb4duhacwb5fjgq.canadacentral-01.azurewebsites.net/api/data/products'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }
}
