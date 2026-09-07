import test from 'node:test';
import assert from 'node:assert/strict';
import { holidaysOn, holidaysForYear } from './src/holidays.js';
const dates = (year,region) => holidaysForYear(year).filter(h=>h.region===region).map(h=>h.date.slice(5));
test('all 2026 Japanese national, substitute, and bridge holidays match Cabinet Office calendar',()=>{
  assert.deepEqual(dates(2026,'jp'),['01-01','01-12','02-11','02-23','03-20','04-29','05-03','05-04','05-05','05-06','07-20','08-11','09-21','09-22','09-23','10-12','11-03','11-23']);
});
test('2027 Japanese equinox substitute and all other dates match Cabinet Office calendar',()=>{
  assert.deepEqual(dates(2027,'jp'),['01-01','01-11','02-11','02-23','03-21','03-22','04-29','05-03','05-04','05-05','07-19','08-11','09-20','09-23','10-11','11-03','11-23']);
});
test('all eleven US federal holidays plus actual Independence Day',()=>{
  assert.deepEqual(dates(2026,'us'),['01-01','01-19','02-16','05-25','06-19','07-03','07-04','09-07','10-12','11-11','11-26','12-25']);
  assert.equal(holidaysOn('2026-07-03')[0].observed,true);
  assert.equal(holidaysOn('2027-12-31').find(h=>h.region==='us').id,'newYear');
});
test('Portugal includes all thirteen mandatory holidays, with movable Easter dates and no weekend substitution',()=>{
  assert.deepEqual(dates(2026,'pt'),['01-01','04-03','04-05','04-25','05-01','06-04','06-10','08-15','10-05','11-01','12-01','12-08','12-25']);
  assert.equal(holidaysOn('2026-04-27').some(h=>h.regions.includes('pt')),false);
  assert.equal(holidaysOn('2027-03-26').some(h=>h.id==='goodFriday'),true);
});
test('Louisiana legal dates include Mardi Gras, Good Friday and even-year Election Day',()=>{
  assert.deepEqual(dates(2026,'la'),['01-08','02-17','04-03','08-30','11-01','11-03']);
  assert.equal(holidaysOn('2027-02-09')[0].id,'mardiGras');
  assert.equal(holidaysForYear(2027).some(h=>h.id==='election'),false);
});
test('shared holidays merge flags; coinciding different holidays remain visible; translations and ordinary days work',()=>{
  assert.deepEqual(holidaysOn('2026-01-01')[0].regions,['us','pt','jp']);
  assert.deepEqual(holidaysOn('2026-04-03')[0].regions,['pt','la']);
  assert.equal(holidaysOn('2026-10-12').length,2);
  assert.equal(holidaysOn('2026-06-10','pt')[0].name,'Dia de Portugal');
  assert.equal(holidaysOn('2026-09-22','ja')[0].name,'国民の休日');
  assert.deepEqual(holidaysOn('2026-09-08'),[]);
});
