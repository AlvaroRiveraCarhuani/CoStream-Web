import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: '',
    // Apuntamos a './features/home/home' porque tu archivo es home.ts
    loadComponent: () => import('./features/home/home').then(m => m.Home)
    },
    {
    path: 'room/:id', 
    // Apuntamos a './features/room/room' porque tu archivo es room.ts
    loadComponent: () => import('./features/room/room').then(m => m.Room)
    },
    {
    path: '**', 
    redirectTo: ''
    }
];