import {test} from 'node:test';
import assert from 'node:assert/strict';
import {schedule,allocate,loanFigures,monthDate} from '../desk/finance.js';
test('flat monthly loan and final rounding reconcile exactly',()=>{
 const rows=schedule(100001,250,3,'2026-01-31');
 assert.deepEqual(rows.map(r=>r.due_date),['2026-02-28','2026-03-31','2026-04-30']);
 assert.equal(rows.reduce((s,r)=>s+r.principal,0),100001);
 assert.equal(rows.reduce((s,r)=>s+r.interest,0),7500);
 assert.equal(rows.reduce((s,r)=>s+r.total,0),107501);
});
test('month-end and leap dates remain anchored',()=>{assert.equal(monthDate('2024-01-31',1),'2024-02-29');assert.equal(monthDate('2024-01-31',2),'2024-03-31');});
test('partial payment then settlement clears the loan exactly',()=>{
 let rows=schedule(100000,200,3,'2026-01-31');rows=allocate(rows,10000);assert.equal(rows[0].paid,10000);assert.equal(rows[1].paid,0);
 const f=loanFigures({schedule:rows},'2026-03-01');assert.equal(f.balance,96000);assert.equal(f.overdue,25333);
 rows=allocate(rows,96000);assert.equal(loanFigures({schedule:rows}).status,'Cleared');
 assert.throws(()=>allocate(rows,1),/exceeds/);
});
test('zero interest and small amounts do not gain rounding money',()=>{const rows=schedule(1,0,3,'2026-01-01');assert.equal(rows.reduce((s,r)=>s+r.total,0),1);assert.equal(rows.at(-1).total,1);});
test('past due begins after due date',()=>{const rows=schedule(10000,0,1,'2026-01-01');assert.equal(loanFigures({schedule:rows},'2026-02-01').overdue,0);assert.equal(loanFigures({schedule:rows},'2026-02-02').overdue,10000);});
