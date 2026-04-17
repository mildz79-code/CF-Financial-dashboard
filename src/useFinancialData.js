import { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildMonthlyMap(lineItems, monthlyRows) {
  const byLabel = {};
  const idToLabel = {};
  lineItems.forEach((li) => {
    idToLabel[li.id] = li.label;
    byLabel[li.label] = { ...li, actual: Array(12).fill(0), budget: Array(12).fill(0), forecast: Array(12).fill(0) };
  });
  monthlyRows.forEach((row) => {
    const label = idToLabel[row.line_item_id];
    if (!label || !byLabel[label]) return;
    const idx = row.month - 1;
    if (row.source === 'actual') byLabel[label].actual[idx] = Number(row.amount);
    else if (row.source === 'budget') byLabel[label].budget[idx] = Number(row.amount);
    else if (row.source === 'forecast') byLabel[label].forecast[idx] = Number(row.amount);
  });
  return byLabel;
}

function sumArray(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function sumCategory(byLabel, category, source) {
  return Object.values(byLabel)
    .filter((item) => item.category === category)
    .reduce((acc, item) => {
      item[source].forEach((v, i) => { acc[i] = (acc[i] || 0) + v; });
      return acc;
    }, Array(12).fill(0));
}

function deriveMetrics(byLabel) {
  const revenueActual = sumCategory(byLabel, 'REVENUE', 'actual');
  const revenueBudget = sumCategory(byLabel, 'REVENUE', 'budget');
  const cogsActual = sumCategory(byLabel, 'COGS', 'actual');
  const cogsBudget = sumCategory(byLabel, 'COGS', 'budget');
  const opexActual = sumCategory(byLabel, 'OPEX', 'actual');
  const opexBudget = sumCategory(byLabel, 'OPEX', 'budget');
  const otherActual = sumCategory(byLabel, 'OTHER', 'actual');
  const otherBudget = sumCategory(byLabel, 'OTHER', 'budget');

  const grossProfitActual = revenueActual.map((r, i) => r - cogsActual[i]);
  const grossProfitBudget = revenueBudget.map((r, i) => r - cogsBudget[i]);
  const netIncomeActual = grossProfitActual.map((gp, i) => gp - opexActual[i] + otherActual[i]);
  const netIncomeBudget = grossProfitBudget.map((gp, i) => gp - opexBudget[i] + otherBudget[i]);

  const actualMonthsCount = revenueActual.filter((v) => v !== 0).length;

  const totalRevenueActual = sumArray(revenueActual);
  const totalCOGSActual = sumArray(cogsActual);
  const totalGrossProfitActual = sumArray(grossProfitActual);
  const totalOpExActual = sumArray(opexActual);
  const totalOtherActual = sumArray(otherActual);
  const totalNetIncomeActual = sumArray(netIncomeActual);

  const totalRevenueBudget = sumArray(revenueBudget);
  const totalCOGSBudget = sumArray(cogsBudget);
  const totalGrossProfitBudget = sumArray(grossProfitBudget);
  const totalOpExBudget = sumArray(opexBudget);
  const totalNetIncomeBudget = sumArray(netIncomeBudget);

  const grossMargin = totalRevenueActual > 0 ? (totalGrossProfitActual / totalRevenueActual) * 100 : 0;
  const netMargin = totalRevenueActual > 0 ? (totalNetIncomeActual / totalRevenueActual) * 100 : 0;

  const cogsItems = Object.values(byLabel).filter((item) => item.category === 'COGS');
  const opexItems = Object.values(byLabel).filter((item) => item.category === 'OPEX');

  const cogsBreakdown = cogsItems.map((item) => ({
    label: item.label,
    actual: sumArray(item.actual),
    budget: sumArray(item.budget),
    sort_order: item.sort_order,
  })).sort((a, b) => a.sort_order - b.sort_order);

  const opexBreakdown = opexItems.map((item) => ({
    label: item.label,
    actual: sumArray(item.actual),
    budget: sumArray(item.budget),
    sort_order: item.sort_order,
  })).sort((a, b) => a.sort_order - b.sort_order);

  const payrollLabels = [
    'Direct Labor - Samuel Hale', 'Direct Labor - Workforce', 'Payroll - Other',
    'Payroll Expenses (Admin)', 'Payroll Taxes', 'Employee Benefits',
  ];
  const payrollItems = payrollLabels
    .map((label) => byLabel[label])
    .filter(Boolean)
    .map((item) => ({
      label: item.label,
      actual: sumArray(item.actual),
      budget: sumArray(item.budget),
      monthly: item.actual,
    }));

  const utilityLabels = ['Utilities - Electricity', 'Utilities - Gas', 'Utilities - Water', 'Utilities - Wastewater'];
  const utilityItems = utilityLabels
    .map((label) => byLabel[label])
    .filter(Boolean)
    .map((item) => ({
      label: item.label,
      actual: sumArray(item.actual),
      budget: sumArray(item.budget),
      monthly: item.actual,
    }));

  const monthlyRevenue = MONTHS.map((m, i) => ({
    month: m,
    actual: revenueActual[i],
    budget: revenueBudget[i],
  }));

  const monthlyNetIncome = MONTHS.map((m, i) => ({
    month: m,
    actual: netIncomeActual[i],
    budget: netIncomeBudget[i],
  }));

  return {
    year: 2026,
    actualMonthsCount,
    months: MONTHS,
    revenue: { actual: revenueActual, budget: revenueBudget },
    cogs: { actual: cogsActual, budget: cogsBudget },
    opex: { actual: opexActual, budget: opexBudget },
    other: { actual: otherActual, budget: otherBudget },
    grossProfit: { actual: grossProfitActual, budget: grossProfitBudget },
    netIncome: { actual: netIncomeActual, budget: netIncomeBudget },
    totals: {
      revenue: { actual: totalRevenueActual, budget: totalRevenueBudget },
      cogs: { actual: totalCOGSActual, budget: totalCOGSBudget },
      grossProfit: { actual: totalGrossProfitActual, budget: totalGrossProfitBudget },
      opex: { actual: totalOpExActual, budget: totalOpExBudget },
      other: { actual: totalOtherActual },
      netIncome: { actual: totalNetIncomeActual, budget: totalNetIncomeBudget },
    },
    margins: { gross: grossMargin, net: netMargin },
    cogsBreakdown,
    opexBreakdown,
    payrollItems,
    utilityItems,
    monthlyRevenue,
    monthlyNetIncome,
    byLabel,
  };
}

const FALLBACK_LINE_ITEMS = [
  { id: 1, label: 'Total Revenue (Sales)', category: 'REVENUE', sort_order: 10 },
  { id: 2, label: 'Direct Labor - Samuel Hale', category: 'COGS', sort_order: 20 },
  { id: 3, label: 'Direct Labor - Workforce', category: 'COGS', sort_order: 30 },
  { id: 4, label: 'Payroll - Other', category: 'COGS', sort_order: 40 },
  { id: 5, label: 'Chemical & Dyestuffs', category: 'COGS', sort_order: 50 },
  { id: 6, label: 'Finishing Supplies - Paper Tube', category: 'COGS', sort_order: 60 },
  { id: 7, label: 'Finishing Supplies - Poly Bags', category: 'COGS', sort_order: 70 },
  { id: 8, label: 'Lab Supplies (Testing)', category: 'COGS', sort_order: 80 },
  { id: 9, label: 'Plant Supplies & Parts', category: 'COGS', sort_order: 90 },
  { id: 10, label: 'Freight and Shipping Costs', category: 'COGS', sort_order: 100 },
  { id: 11, label: 'Truck Repair', category: 'COGS', sort_order: 110 },
  { id: 12, label: 'Insurance - Liability & Property', category: 'COGS', sort_order: 120 },
  { id: 13, label: 'Utilities - Electricity', category: 'COGS', sort_order: 130 },
  { id: 14, label: 'Utilities - Gas', category: 'COGS', sort_order: 140 },
  { id: 15, label: 'Utilities - Water', category: 'COGS', sort_order: 150 },
  { id: 16, label: 'Utilities - Wastewater', category: 'COGS', sort_order: 160 },
  { id: 17, label: 'Knitting', category: 'COGS', sort_order: 170 },
  { id: 18, label: 'Payroll Expenses (Admin)', category: 'OPEX', sort_order: 200 },
  { id: 19, label: 'Payroll Taxes', category: 'OPEX', sort_order: 210 },
  { id: 20, label: 'Employee Benefits', category: 'OPEX', sort_order: 220 },
  { id: 21, label: 'Rent Expense', category: 'OPEX', sort_order: 230 },
  { id: 22, label: 'Rent Management Fee', category: 'OPEX', sort_order: 240 },
  { id: 23, label: 'Professional Fees - Legal', category: 'OPEX', sort_order: 250 },
  { id: 24, label: 'Professional Fees - Trucking', category: 'OPEX', sort_order: 260 },
  { id: 25, label: 'Professional Fees - Other', category: 'OPEX', sort_order: 270 },
  { id: 26, label: 'Sales Commission', category: 'OPEX', sort_order: 280 },
  { id: 27, label: 'Sales Promotion', category: 'OPEX', sort_order: 290 },
  { id: 28, label: 'Office Expense', category: 'OPEX', sort_order: 300 },
  { id: 29, label: 'Office Supplies & Printing', category: 'OPEX', sort_order: 310 },
  { id: 30, label: 'Computer and Internet', category: 'OPEX', sort_order: 320 },
  { id: 31, label: 'Telephone Expense', category: 'OPEX', sort_order: 330 },
  { id: 32, label: 'Automobile Expense', category: 'OPEX', sort_order: 340 },
  { id: 33, label: 'Repairs - Computer', category: 'OPEX', sort_order: 350 },
  { id: 34, label: 'Repairs - Equipment', category: 'OPEX', sort_order: 360 },
  { id: 35, label: 'Insurance - Health', category: 'OPEX', sort_order: 370 },
  { id: 36, label: 'Insurance - Truck', category: 'OPEX', sort_order: 380 },
  { id: 37, label: 'Insurance - Trade Credit', category: 'OPEX', sort_order: 390 },
  { id: 38, label: 'Licenses - Permits', category: 'OPEX', sort_order: 400 },
  { id: 39, label: 'Post Office Charge', category: 'OPEX', sort_order: 410 },
  { id: 40, label: 'Equipment Rental', category: 'OPEX', sort_order: 420 },
  { id: 41, label: 'Contract Labor', category: 'OPEX', sort_order: 430 },
  { id: 42, label: 'Outside Service', category: 'OPEX', sort_order: 440 },
  { id: 43, label: 'Bank Service Charges', category: 'OPEX', sort_order: 450 },
  { id: 44, label: 'Interest Expenses', category: 'OPEX', sort_order: 460 },
  { id: 45, label: 'Travel', category: 'OPEX', sort_order: 470 },
  { id: 46, label: 'Waste Disposal', category: 'OPEX', sort_order: 480 },
  { id: 47, label: 'Donations', category: 'OPEX', sort_order: 490 },
  { id: 48, label: 'Medical Expense & Supplies', category: 'OPEX', sort_order: 500 },
  { id: 49, label: 'Other Income (Refunds)', category: 'OTHER', sort_order: 600 },
];

const FALLBACK_MONTHLY = [
  // Jan actuals
  { line_item_id: 1, year: 2026, month: 1, amount: 840783.19, source: 'actual' },
  { line_item_id: 2, year: 2026, month: 1, amount: 191612.00, source: 'actual' },
  { line_item_id: 3, year: 2026, month: 1, amount: 13153.25, source: 'actual' },
  { line_item_id: 4, year: 2026, month: 1, amount: 1125.80, source: 'actual' },
  { line_item_id: 5, year: 2026, month: 1, amount: 104446.00, source: 'actual' },
  { line_item_id: 6, year: 2026, month: 1, amount: 7667.00, source: 'actual' },
  { line_item_id: 7, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 8, year: 2026, month: 1, amount: 1365.00, source: 'actual' },
  { line_item_id: 9, year: 2026, month: 1, amount: 7529.00, source: 'actual' },
  { line_item_id: 10, year: 2026, month: 1, amount: 3850.00, source: 'actual' },
  { line_item_id: 11, year: 2026, month: 1, amount: 560.00, source: 'actual' },
  { line_item_id: 12, year: 2026, month: 1, amount: 2692.19, source: 'actual' },
  { line_item_id: 13, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 14, year: 2026, month: 1, amount: 49255.00, source: 'actual' },
  { line_item_id: 15, year: 2026, month: 1, amount: 25988.00, source: 'actual' },
  { line_item_id: 16, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 17, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 18, year: 2026, month: 1, amount: 57800.00, source: 'actual' },
  { line_item_id: 19, year: 2026, month: 1, amount: 6269.00, source: 'actual' },
  { line_item_id: 20, year: 2026, month: 1, amount: 2863.00, source: 'actual' },
  { line_item_id: 21, year: 2026, month: 1, amount: 87672.00, source: 'actual' },
  { line_item_id: 22, year: 2026, month: 1, amount: 16764.00, source: 'actual' },
  { line_item_id: 23, year: 2026, month: 1, amount: 2059.00, source: 'actual' },
  { line_item_id: 24, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 25, year: 2026, month: 1, amount: 547.00, source: 'actual' },
  { line_item_id: 26, year: 2026, month: 1, amount: 3000.00, source: 'actual' },
  { line_item_id: 27, year: 2026, month: 1, amount: 1069.00, source: 'actual' },
  { line_item_id: 28, year: 2026, month: 1, amount: 1402.00, source: 'actual' },
  { line_item_id: 29, year: 2026, month: 1, amount: 652.00, source: 'actual' },
  { line_item_id: 30, year: 2026, month: 1, amount: 1065.00, source: 'actual' },
  { line_item_id: 31, year: 2026, month: 1, amount: 843.00, source: 'actual' },
  { line_item_id: 32, year: 2026, month: 1, amount: 1728.00, source: 'actual' },
  { line_item_id: 33, year: 2026, month: 1, amount: 800.00, source: 'actual' },
  { line_item_id: 34, year: 2026, month: 1, amount: 38125.00, source: 'actual' },
  { line_item_id: 35, year: 2026, month: 1, amount: 3849.00, source: 'actual' },
  { line_item_id: 36, year: 2026, month: 1, amount: 1924.00, source: 'actual' },
  { line_item_id: 37, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 38, year: 2026, month: 1, amount: 600.00, source: 'actual' },
  { line_item_id: 39, year: 2026, month: 1, amount: 349.00, source: 'actual' },
  { line_item_id: 40, year: 2026, month: 1, amount: 108.00, source: 'actual' },
  { line_item_id: 41, year: 2026, month: 1, amount: 10000.00, source: 'actual' },
  { line_item_id: 42, year: 2026, month: 1, amount: 2700.00, source: 'actual' },
  { line_item_id: 43, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 44, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 45, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 46, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 47, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 48, year: 2026, month: 1, amount: 0, source: 'actual' },
  { line_item_id: 49, year: 2026, month: 1, amount: 0, source: 'actual' },

  // Feb actuals
  { line_item_id: 1, year: 2026, month: 2, amount: 695332.94, source: 'actual' },
  { line_item_id: 2, year: 2026, month: 2, amount: 235575.85, source: 'actual' },
  { line_item_id: 3, year: 2026, month: 2, amount: 18161.51, source: 'actual' },
  { line_item_id: 4, year: 2026, month: 2, amount: 750.38, source: 'actual' },
  { line_item_id: 5, year: 2026, month: 2, amount: 66730.58, source: 'actual' },
  { line_item_id: 6, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 7, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 8, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 9, year: 2026, month: 2, amount: 3445.62, source: 'actual' },
  { line_item_id: 10, year: 2026, month: 2, amount: 2787.40, source: 'actual' },
  { line_item_id: 11, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 12, year: 2026, month: 2, amount: 2692.19, source: 'actual' },
  { line_item_id: 13, year: 2026, month: 2, amount: 32137.91, source: 'actual' },
  { line_item_id: 14, year: 2026, month: 2, amount: 70571.11, source: 'actual' },
  { line_item_id: 15, year: 2026, month: 2, amount: 26153.78, source: 'actual' },
  { line_item_id: 16, year: 2026, month: 2, amount: 12736.85, source: 'actual' },
  { line_item_id: 17, year: 2026, month: 2, amount: 113895.00, source: 'actual' },
  { line_item_id: 18, year: 2026, month: 2, amount: 67600.00, source: 'actual' },
  { line_item_id: 19, year: 2026, month: 2, amount: 70397.73, source: 'actual' },
  { line_item_id: 20, year: 2026, month: 2, amount: 2863.28, source: 'actual' },
  { line_item_id: 21, year: 2026, month: 2, amount: 87672.00, source: 'actual' },
  { line_item_id: 22, year: 2026, month: 2, amount: 16764.00, source: 'actual' },
  { line_item_id: 23, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 24, year: 2026, month: 2, amount: 4260.00, source: 'actual' },
  { line_item_id: 25, year: 2026, month: 2, amount: 1150.00, source: 'actual' },
  { line_item_id: 26, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 27, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 28, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 29, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 30, year: 2026, month: 2, amount: 1065.00, source: 'actual' },
  { line_item_id: 31, year: 2026, month: 2, amount: 1261.00, source: 'actual' },
  { line_item_id: 32, year: 2026, month: 2, amount: 2252.00, source: 'actual' },
  { line_item_id: 33, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 34, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 35, year: 2026, month: 2, amount: 3849.36, source: 'actual' },
  { line_item_id: 36, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 37, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 38, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 39, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 40, year: 2026, month: 2, amount: 108.33, source: 'actual' },
  { line_item_id: 41, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 42, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 43, year: 2026, month: 2, amount: 408.37, source: 'actual' },
  { line_item_id: 44, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 45, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 46, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 47, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 48, year: 2026, month: 2, amount: 0, source: 'actual' },
  { line_item_id: 49, year: 2026, month: 2, amount: 0, source: 'actual' },

  // Mar actuals
  { line_item_id: 1, year: 2026, month: 3, amount: 985555.20, source: 'actual' },
  { line_item_id: 2, year: 2026, month: 3, amount: 229361.64, source: 'actual' },
  { line_item_id: 3, year: 2026, month: 3, amount: 18863.16, source: 'actual' },
  { line_item_id: 4, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 5, year: 2026, month: 3, amount: 163489.39, source: 'actual' },
  { line_item_id: 6, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 7, year: 2026, month: 3, amount: 2225.00, source: 'actual' },
  { line_item_id: 8, year: 2026, month: 3, amount: 4780.00, source: 'actual' },
  { line_item_id: 9, year: 2026, month: 3, amount: 9143.62, source: 'actual' },
  { line_item_id: 10, year: 2026, month: 3, amount: 5375.53, source: 'actual' },
  { line_item_id: 11, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 12, year: 2026, month: 3, amount: 2692.19, source: 'actual' },
  { line_item_id: 13, year: 2026, month: 3, amount: 29747.30, source: 'actual' },
  { line_item_id: 14, year: 2026, month: 3, amount: 35012.72, source: 'actual' },
  { line_item_id: 15, year: 2026, month: 3, amount: 22770.67, source: 'actual' },
  { line_item_id: 16, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 17, year: 2026, month: 3, amount: 24082.70, source: 'actual' },
  { line_item_id: 18, year: 2026, month: 3, amount: 57800.00, source: 'actual' },
  { line_item_id: 19, year: 2026, month: 3, amount: 4685.16, source: 'actual' },
  { line_item_id: 20, year: 2026, month: 3, amount: 2864.00, source: 'actual' },
  { line_item_id: 21, year: 2026, month: 3, amount: 87672.00, source: 'actual' },
  { line_item_id: 22, year: 2026, month: 3, amount: 16764.00, source: 'actual' },
  { line_item_id: 23, year: 2026, month: 3, amount: 600.00, source: 'actual' },
  { line_item_id: 24, year: 2026, month: 3, amount: 5705.13, source: 'actual' },
  { line_item_id: 25, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 26, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 27, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 28, year: 2026, month: 3, amount: 1750.00, source: 'actual' },
  { line_item_id: 29, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 30, year: 2026, month: 3, amount: 1205.00, source: 'actual' },
  { line_item_id: 31, year: 2026, month: 3, amount: 843.06, source: 'actual' },
  { line_item_id: 32, year: 2026, month: 3, amount: 1437.43, source: 'actual' },
  { line_item_id: 33, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 34, year: 2026, month: 3, amount: 8660.00, source: 'actual' },
  { line_item_id: 35, year: 2026, month: 3, amount: 3849.36, source: 'actual' },
  { line_item_id: 36, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 37, year: 2026, month: 3, amount: 7182.00, source: 'actual' },
  { line_item_id: 38, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 39, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 40, year: 2026, month: 3, amount: 108.33, source: 'actual' },
  { line_item_id: 41, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 42, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 43, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 44, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 45, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 46, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 47, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 48, year: 2026, month: 3, amount: 0, source: 'actual' },
  { line_item_id: 49, year: 2026, month: 3, amount: 3808.00, source: 'actual' },

  // Budget (Jan baseline * 12 — using Jan values as monthly budget)
  { line_item_id: 1, year: 2026, month: 1, amount: 844680.00, source: 'budget' },
  { line_item_id: 1, year: 2026, month: 2, amount: 844680.00, source: 'budget' },
  { line_item_id: 1, year: 2026, month: 3, amount: 844680.00, source: 'budget' },
  { line_item_id: 1, year: 2026, month: 4, amount: 844680.00, source: 'budget' },
  { line_item_id: 1, year: 2026, month: 5, amount: 844680.00, source: 'budget' },
  { line_item_id: 1, year: 2026, month: 6, amount: 844680.00, source: 'budget' },
  { line_item_id: 1, year: 2026, month: 7, amount: 844680.00, source: 'budget' },
  { line_item_id: 1, year: 2026, month: 8, amount: 844680.00, source: 'budget' },
  { line_item_id: 1, year: 2026, month: 9, amount: 844680.00, source: 'budget' },
  { line_item_id: 1, year: 2026, month: 10, amount: 844680.00, source: 'budget' },
  { line_item_id: 1, year: 2026, month: 11, amount: 844680.00, source: 'budget' },
  { line_item_id: 1, year: 2026, month: 12, amount: 844680.00, source: 'budget' },
];

export function useFinancialData(year = 2026) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState({ lineItems: [], monthly: [] });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!supabase) {
        if (!cancelled) {
          setRawData({ lineItems: FALLBACK_LINE_ITEMS, monthly: FALLBACK_MONTHLY });
          setLoading(false);
        }
        return;
      }

      try {
        const [liRes, pmRes] = await Promise.all([
          supabase.from('pl_line_items').select('*').order('sort_order'),
          supabase.from('pl_monthly').select('*').eq('year', year),
        ]);

        if (liRes.error) throw liRes.error;
        if (pmRes.error) throw pmRes.error;

        if (!cancelled) {
          setRawData({ lineItems: liRes.data, monthly: pmRes.data });
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch from Supabase, using fallback data:', err);
        if (!cancelled) {
          setRawData({ lineItems: FALLBACK_LINE_ITEMS, monthly: FALLBACK_MONTHLY });
          setError(err);
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [year]);

  const data = useMemo(() => {
    if (!rawData.lineItems.length) return null;
    const byLabel = buildMonthlyMap(rawData.lineItems, rawData.monthly);
    return deriveMetrics(byLabel);
  }, [rawData]);

  return { data, loading, error };
}
