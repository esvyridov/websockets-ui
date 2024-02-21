import { Ship } from './db';

export const BOT_SHIPS: Ship[][] = [
    [{ position: { x: 2, y: 6 }, direction: false, type: 'huge' as const, length: 4 }, { position: { x: 7, y: 7 }, direction: false, type: 'large' as const, length: 3 }, { position: { x: 5, y: 1 }, direction: false, type: 'large' as const, length: 3 }, { position: { x: 7, y: 3 }, direction: true, type: 'medium' as const, length: 2 }, { position: { x: 1, y: 2 }, direction: true, type: 'medium' as const, length: 2 }, { position: { x: 3, y: 4 }, direction: false, type: 'medium' as const, length: 2 }, { position: { x: 3, y: 1 }, direction: false, type: 'small' as const, length: 1 }, { position: { x: 9, y: 1 }, direction: false, type: 'small' as const, length: 1 }, { position: { x: 0, y: 9 }, direction: false, type: 'small' as const, length: 1 }, { position: { x: 9, y: 3 }, direction: false, type: 'small' as const, length: 1 }],
    [{ position: { x: 4, y: 7 }, direction: false, type: 'huge' as const, length: 4 }, { position: { x: 6, y: 2 }, direction: false, type: 'large' as const, length: 3 }, { position: { x: 0, y: 8 }, direction: false, type: 'large' as const, length: 3 }, { position: { x: 1, y: 0 }, direction: false, type: 'medium' as const, length: 2 }, { position: { x: 2, y: 4 }, direction: false, type: 'medium' as const, length: 2 }, { position: { x: 0, y: 2 }, direction: true, type: 'medium' as const, length: 2 }, { position: { x: 4, y: 0 }, direction: true, type: 'small' as const, length: 1 }, { position: { x: 9, y: 8 }, direction: false, type: 'small' as const, length: 1 }, { position: { x: 8, y: 4 }, direction: false, type: 'small' as const, length: 1 }, { position: { x: 3, y: 2 }, direction: false, type: 'small' as const, length: 1 }],
    [{ position: { x: 3, y: 7 }, direction: false, type: 'huge' as const, length: 4 }, { position: { x: 2, y: 0 }, direction: false, type: 'large' as const, length: 3 }, { position: { x: 4, y: 2 }, direction: true, type: 'large' as const, length: 3 }, { position: { x: 8, y: 7 }, direction: true, type: 'medium' as const, length: 2 }, { position: { x: 8, y: 1 }, direction: true, type: 'medium' as const, length: 2 }, { position: { x: 7, y: 4 }, direction: true, type: 'medium' as const, length: 2 }, { position: { x: 3, y: 9 }, direction: true, type: 'small' as const, length: 1 }, { position: { x: 0, y: 0 }, direction: false, type: 'small' as const, length: 1 }, { position: { x: 1, y: 4 }, direction: false, type: 'small' as const, length: 1 }, { position: { x: 6, y: 1 }, direction: false, type: 'small' as const, length: 1 }],
].map((ships) => ships.map((ship) => ({
    ...ship,
    _health: ship.length,
})))