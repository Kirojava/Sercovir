import { Router, type IRouter } from "express";

const router: IRouter = Router();

export interface CountryEconData {
  id: string;
  name: string;
  flag: string;
  region: string;
  gdp: number;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  militaryPct: number;
  tradeBalance: number;
  debtPct: number;
  gdpHistory: { year: number; value: number }[];
  growthHistory: { year: number; value: number }[];
}

export interface TradePartner {
  country: string;
  exports: number;
  imports: number;
  balance: number;
}

const ECONOMICS_DATA: CountryEconData[] = [
  {
    id: 'US', name: 'United States', flag: '🇺🇸', region: 'North America',
    gdp: 27.36, gdpGrowth: 2.5, inflation: 3.4, unemployment: 3.7, militaryPct: 3.49, tradeBalance: -773, debtPct: 129,
    gdpHistory: [
      { year: 2013, value: 16.8 }, { year: 2014, value: 17.5 }, { year: 2015, value: 18.1 },
      { year: 2016, value: 18.7 }, { year: 2017, value: 19.5 }, { year: 2018, value: 20.6 },
      { year: 2019, value: 21.4 }, { year: 2020, value: 21.0 }, { year: 2021, value: 23.3 },
      { year: 2022, value: 25.5 }, { year: 2023, value: 27.36 }
    ],
    growthHistory: [
      { year: 2013, value: 1.8 }, { year: 2014, value: 2.5 }, { year: 2015, value: 3.1 },
      { year: 2016, value: 1.7 }, { year: 2017, value: 2.3 }, { year: 2018, value: 3.0 },
      { year: 2019, value: 2.3 }, { year: 2020, value: -2.8 }, { year: 2021, value: 5.9 },
      { year: 2022, value: 2.1 }, { year: 2023, value: 2.5 }
    ]
  },
  {
    id: 'CN', name: 'China', flag: '🇨🇳', region: 'East Asia',
    gdp: 17.79, gdpGrowth: 5.2, inflation: 0.2, unemployment: 5.2, militaryPct: 1.69, tradeBalance: 823, debtPct: 77,
    gdpHistory: [
      { year: 2013, value: 9.6 }, { year: 2014, value: 10.5 }, { year: 2015, value: 11.1 },
      { year: 2016, value: 11.2 }, { year: 2017, value: 12.3 }, { year: 2018, value: 13.9 },
      { year: 2019, value: 14.3 }, { year: 2020, value: 14.7 }, { year: 2021, value: 17.7 },
      { year: 2022, value: 17.9 }, { year: 2023, value: 17.79 }
    ],
    growthHistory: [
      { year: 2013, value: 7.8 }, { year: 2014, value: 7.4 }, { year: 2015, value: 7.0 },
      { year: 2016, value: 6.8 }, { year: 2017, value: 6.9 }, { year: 2018, value: 6.7 },
      { year: 2019, value: 6.0 }, { year: 2020, value: 2.2 }, { year: 2021, value: 8.4 },
      { year: 2022, value: 3.0 }, { year: 2023, value: 5.2 }
    ]
  },
  {
    id: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe',
    gdp: 4.07, gdpGrowth: -0.3, inflation: 5.9, unemployment: 5.8, militaryPct: 1.57, tradeBalance: 237, debtPct: 63,
    gdpHistory: [
      { year: 2013, value: 3.7 }, { year: 2014, value: 3.9 }, { year: 2015, value: 3.4 },
      { year: 2016, value: 3.5 }, { year: 2017, value: 3.7 }, { year: 2018, value: 4.0 },
      { year: 2019, value: 3.9 }, { year: 2020, value: 3.8 }, { year: 2021, value: 4.2 },
      { year: 2022, value: 4.1 }, { year: 2023, value: 4.07 }
    ],
    growthHistory: [
      { year: 2013, value: 0.5 }, { year: 2014, value: 2.2 }, { year: 2015, value: 1.7 },
      { year: 2016, value: 2.2 }, { year: 2017, value: 2.6 }, { year: 2018, value: 1.1 },
      { year: 2019, value: 1.1 }, { year: 2020, value: -3.8 }, { year: 2021, value: 3.7 },
      { year: 2022, value: 1.8 }, { year: 2023, value: -0.3 }
    ]
  },
  {
    id: 'JP', name: 'Japan', flag: '🇯🇵', region: 'East Asia',
    gdp: 4.21, gdpGrowth: 1.9, inflation: 3.3, unemployment: 2.6, militaryPct: 1.24, tradeBalance: -68, debtPct: 255,
    gdpHistory: [
      { year: 2013, value: 5.2 }, { year: 2014, value: 4.9 }, { year: 2015, value: 4.4 },
      { year: 2016, value: 5.0 }, { year: 2017, value: 4.9 }, { year: 2018, value: 5.0 },
      { year: 2019, value: 5.1 }, { year: 2020, value: 5.1 }, { year: 2021, value: 4.9 },
      { year: 2022, value: 4.2 }, { year: 2023, value: 4.21 }
    ],
    growthHistory: [
      { year: 2013, value: 2.0 }, { year: 2014, value: -0.4 }, { year: 2015, value: 1.6 },
      { year: 2016, value: 0.8 }, { year: 2017, value: 1.7 }, { year: 2018, value: 0.6 },
      { year: 2019, value: -0.4 }, { year: 2020, value: -4.3 }, { year: 2021, value: 2.1 },
      { year: 2022, value: 1.0 }, { year: 2023, value: 1.9 }
    ]
  },
  {
    id: 'IN', name: 'India', flag: '🇮🇳', region: 'South Asia',
    gdp: 3.73, gdpGrowth: 8.2, inflation: 5.4, unemployment: 8.0, militaryPct: 2.44, tradeBalance: -87, debtPct: 81,
    gdpHistory: [
      { year: 2013, value: 1.9 }, { year: 2014, value: 2.0 }, { year: 2015, value: 2.1 },
      { year: 2016, value: 2.3 }, { year: 2017, value: 2.7 }, { year: 2018, value: 2.7 },
      { year: 2019, value: 2.8 }, { year: 2020, value: 2.7 }, { year: 2021, value: 3.2 },
      { year: 2022, value: 3.4 }, { year: 2023, value: 3.73 }
    ],
    growthHistory: [
      { year: 2013, value: 6.4 }, { year: 2014, value: 7.4 }, { year: 2015, value: 8.0 },
      { year: 2016, value: 8.3 }, { year: 2017, value: 6.8 }, { year: 2018, value: 6.5 },
      { year: 2019, value: 3.9 }, { year: 2020, value: -6.6 }, { year: 2021, value: 8.7 },
      { year: 2022, value: 7.2 }, { year: 2023, value: 8.2 }
    ]
  },
  {
    id: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe',
    gdp: 3.09, gdpGrowth: 0.1, inflation: 7.3, unemployment: 4.3, militaryPct: 2.27, tradeBalance: -110, debtPct: 101,
    gdpHistory: [
      { year: 2013, value: 2.7 }, { year: 2014, value: 3.1 }, { year: 2015, value: 2.9 },
      { year: 2016, value: 2.7 }, { year: 2017, value: 2.6 }, { year: 2018, value: 2.9 },
      { year: 2019, value: 2.8 }, { year: 2020, value: 2.7 }, { year: 2021, value: 3.1 },
      { year: 2022, value: 3.1 }, { year: 2023, value: 3.09 }
    ],
    growthHistory: [
      { year: 2013, value: 2.1 }, { year: 2014, value: 3.1 }, { year: 2015, value: 2.4 },
      { year: 2016, value: 1.9 }, { year: 2017, value: 2.4 }, { year: 2018, value: 1.3 },
      { year: 2019, value: 1.6 }, { year: 2020, value: -11.0 }, { year: 2021, value: 7.4 },
      { year: 2022, value: 4.1 }, { year: 2023, value: 0.1 }
    ]
  },
  {
    id: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe',
    gdp: 2.92, gdpGrowth: 0.9, inflation: 5.7, unemployment: 7.2, militaryPct: 2.06, tradeBalance: -52, debtPct: 112,
    gdpHistory: [
      { year: 2013, value: 2.8 }, { year: 2014, value: 2.8 }, { year: 2015, value: 2.4 },
      { year: 2016, value: 2.5 }, { year: 2017, value: 2.6 }, { year: 2018, value: 2.8 },
      { year: 2019, value: 2.7 }, { year: 2020, value: 2.6 }, { year: 2021, value: 2.9 },
      { year: 2022, value: 2.8 }, { year: 2023, value: 2.92 }
    ],
    growthHistory: [
      { year: 2013, value: 0.6 }, { year: 2014, value: 1.0 }, { year: 2015, value: 1.1 },
      { year: 2016, value: 1.1 }, { year: 2017, value: 2.4 }, { year: 2018, value: 1.8 },
      { year: 2019, value: 1.5 }, { year: 2020, value: -7.9 }, { year: 2021, value: 6.8 },
      { year: 2022, value: 2.5 }, { year: 2023, value: 0.9 }
    ]
  },
  {
    id: 'RU', name: 'Russia', flag: '🇷🇺', region: 'Eastern Europe',
    gdp: 2.24, gdpGrowth: 3.6, inflation: 5.9, unemployment: 3.2, militaryPct: 4.05, tradeBalance: 160, debtPct: 17,
    gdpHistory: [
      { year: 2013, value: 2.3 }, { year: 2014, value: 2.1 }, { year: 2015, value: 1.4 },
      { year: 2016, value: 1.3 }, { year: 2017, value: 1.6 }, { year: 2018, value: 1.7 },
      { year: 2019, value: 1.7 }, { year: 2020, value: 1.5 }, { year: 2021, value: 1.8 },
      { year: 2022, value: 2.2 }, { year: 2023, value: 2.24 }
    ],
    growthHistory: [
      { year: 2013, value: 1.8 }, { year: 2014, value: 0.7 }, { year: 2015, value: -2.0 },
      { year: 2016, value: 0.2 }, { year: 2017, value: 1.8 }, { year: 2018, value: 2.8 },
      { year: 2019, value: 2.2 }, { year: 2020, value: -2.7 }, { year: 2021, value: 5.6 },
      { year: 2022, value: -2.1 }, { year: 2023, value: 3.6 }
    ]
  },
  {
    id: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East',
    gdp: 1.07, gdpGrowth: -0.8, inflation: 2.3, unemployment: 5.6, militaryPct: 6.55, tradeBalance: 145, debtPct: 23,
    gdpHistory: [
      { year: 2013, value: 0.75 }, { year: 2014, value: 0.75 }, { year: 2015, value: 0.65 },
      { year: 2016, value: 0.64 }, { year: 2017, value: 0.68 }, { year: 2018, value: 0.79 },
      { year: 2019, value: 0.79 }, { year: 2020, value: 0.70 }, { year: 2021, value: 0.83 },
      { year: 2022, value: 1.11 }, { year: 2023, value: 1.07 }
    ],
    growthHistory: [
      { year: 2013, value: 2.7 }, { year: 2014, value: 3.7 }, { year: 2015, value: 4.1 },
      { year: 2016, value: 1.7 }, { year: 2017, value: -0.7 }, { year: 2018, value: 2.5 },
      { year: 2019, value: 0.3 }, { year: 2020, value: -4.1 }, { year: 2021, value: 3.2 },
      { year: 2022, value: 8.7 }, { year: 2023, value: -0.8 }
    ]
  },
  {
    id: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'South America',
    gdp: 2.13, gdpGrowth: 2.9, inflation: 4.6, unemployment: 7.8, militaryPct: 1.13, tradeBalance: 73, debtPct: 88,
    gdpHistory: [
      { year: 2013, value: 2.5 }, { year: 2014, value: 2.5 }, { year: 2015, value: 1.8 },
      { year: 2016, value: 1.8 }, { year: 2017, value: 2.1 }, { year: 2018, value: 1.9 },
      { year: 2019, value: 1.8 }, { year: 2020, value: 1.4 }, { year: 2021, value: 1.6 },
      { year: 2022, value: 1.9 }, { year: 2023, value: 2.13 }
    ],
    growthHistory: [
      { year: 2013, value: 3.0 }, { year: 2014, value: 0.5 }, { year: 2015, value: -3.5 },
      { year: 2016, value: -3.3 }, { year: 2017, value: 1.3 }, { year: 2018, value: 1.8 },
      { year: 2019, value: 1.2 }, { year: 2020, value: -3.9 }, { year: 2021, value: 5.0 },
      { year: 2022, value: 3.0 }, { year: 2023, value: 2.9 }
    ]
  },
  {
    id: 'TR', name: 'Turkey', flag: '🇹🇷', region: 'Middle East',
    gdp: 1.15, gdpGrowth: 4.5, inflation: 53.9, unemployment: 9.4, militaryPct: 1.48, tradeBalance: -45, debtPct: 31,
    gdpHistory: [
      { year: 2013, value: 0.95 }, { year: 2014, value: 0.93 }, { year: 2015, value: 0.86 },
      { year: 2016, value: 0.86 }, { year: 2017, value: 0.86 }, { year: 2018, value: 0.77 },
      { year: 2019, value: 0.76 }, { year: 2020, value: 0.72 }, { year: 2021, value: 0.82 },
      { year: 2022, value: 0.91 }, { year: 2023, value: 1.15 }
    ],
    growthHistory: [
      { year: 2013, value: 8.5 }, { year: 2014, value: 5.2 }, { year: 2015, value: 6.1 },
      { year: 2016, value: 3.3 }, { year: 2017, value: 7.5 }, { year: 2018, value: 3.0 },
      { year: 2019, value: 0.9 }, { year: 2020, value: 1.9 }, { year: 2021, value: 11.4 },
      { year: 2022, value: 5.6 }, { year: 2023, value: 4.5 }
    ]
  },
  {
    id: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'East Asia',
    gdp: 1.71, gdpGrowth: 1.4, inflation: 3.6, unemployment: 2.7, militaryPct: 2.77, tradeBalance: 30, debtPct: 54,
    gdpHistory: [
      { year: 2013, value: 1.3 }, { year: 2014, value: 1.4 }, { year: 2015, value: 1.4 },
      { year: 2016, value: 1.4 }, { year: 2017, value: 1.5 }, { year: 2018, value: 1.7 },
      { year: 2019, value: 1.6 }, { year: 2020, value: 1.6 }, { year: 2021, value: 1.8 },
      { year: 2022, value: 1.7 }, { year: 2023, value: 1.71 }
    ],
    growthHistory: [
      { year: 2013, value: 2.9 }, { year: 2014, value: 3.2 }, { year: 2015, value: 2.8 },
      { year: 2016, value: 2.9 }, { year: 2017, value: 3.2 }, { year: 2018, value: 2.9 },
      { year: 2019, value: 2.2 }, { year: 2020, value: -0.7 }, { year: 2021, value: 4.1 },
      { year: 2022, value: 2.6 }, { year: 2023, value: 1.4 }
    ]
  },
  {
    id: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania',
    gdp: 1.71, gdpGrowth: 2.0, inflation: 5.4, unemployment: 3.7, militaryPct: 2.05, tradeBalance: 56, debtPct: 52,
    gdpHistory: [
      { year: 2013, value: 1.6 }, { year: 2014, value: 1.5 }, { year: 2015, value: 1.3 },
      { year: 2016, value: 1.2 }, { year: 2017, value: 1.4 }, { year: 2018, value: 1.4 },
      { year: 2019, value: 1.4 }, { year: 2020, value: 1.3 }, { year: 2021, value: 1.6 },
      { year: 2022, value: 1.7 }, { year: 2023, value: 1.71 }
    ],
    growthHistory: [
      { year: 2013, value: 2.0 }, { year: 2014, value: 2.7 }, { year: 2015, value: 2.3 },
      { year: 2016, value: 2.8 }, { year: 2017, value: 2.4 }, { year: 2018, value: 2.8 },
      { year: 2019, value: 2.0 }, { year: 2020, value: -1.8 }, { year: 2021, value: 5.2 },
      { year: 2022, value: 3.7 }, { year: 2023, value: 2.0 }
    ]
  },
  {
    id: 'IL', name: 'Israel', flag: '🇮🇱', region: 'Middle East',
    gdp: 0.52, gdpGrowth: 2.0, inflation: 4.2, unemployment: 4.0, militaryPct: 4.48, tradeBalance: 8, debtPct: 58,
    gdpHistory: [
      { year: 2013, value: 0.29 }, { year: 2014, value: 0.31 }, { year: 2015, value: 0.31 },
      { year: 2016, value: 0.32 }, { year: 2017, value: 0.35 }, { year: 2018, value: 0.37 },
      { year: 2019, value: 0.40 }, { year: 2020, value: 0.41 }, { year: 2021, value: 0.48 },
      { year: 2022, value: 0.53 }, { year: 2023, value: 0.52 }
    ],
    growthHistory: [
      { year: 2013, value: 4.4 }, { year: 2014, value: 3.7 }, { year: 2015, value: 2.8 },
      { year: 2016, value: 4.2 }, { year: 2017, value: 4.3 }, { year: 2018, value: 4.2 },
      { year: 2019, value: 4.1 }, { year: 2020, value: -1.5 }, { year: 2021, value: 8.6 },
      { year: 2022, value: 6.5 }, { year: 2023, value: 2.0 }
    ]
  },
  {
    id: 'UA', name: 'Ukraine', flag: '🇺🇦', region: 'Eastern Europe',
    gdp: 0.18, gdpGrowth: 5.3, inflation: 11.6, unemployment: 17.9, militaryPct: 36.7, tradeBalance: -23, debtPct: 82,
    gdpHistory: [
      { year: 2013, value: 0.18 }, { year: 2014, value: 0.13 }, { year: 2015, value: 0.09 },
      { year: 2016, value: 0.09 }, { year: 2017, value: 0.11 }, { year: 2018, value: 0.13 },
      { year: 2019, value: 0.15 }, { year: 2020, value: 0.15 }, { year: 2021, value: 0.20 },
      { year: 2022, value: 0.16 }, { year: 2023, value: 0.18 }
    ],
    growthHistory: [
      { year: 2013, value: 0.0 }, { year: 2014, value: -6.6 }, { year: 2015, value: -9.8 },
      { year: 2016, value: 2.4 }, { year: 2017, value: 2.5 }, { year: 2018, value: 3.5 },
      { year: 2019, value: 3.2 }, { year: 2020, value: -3.8 }, { year: 2021, value: 3.4 },
      { year: 2022, value: -29.1 }, { year: 2023, value: 5.3 }
    ]
  }
];

const TRADE_FLOWS = [
  { from: 'United States', to: 'China', value: 500, type: 'imports' },
  { from: 'China', to: 'United States', value: 148, type: 'imports' },
  { from: 'United States', to: 'European Union', value: 370, type: 'exports' },
  { from: 'China', to: 'ASEAN', value: 450, type: 'exports' },
  { from: 'Germany', to: 'China', value: 97, type: 'exports' },
  { from: 'Russia', to: 'China', value: 111, type: 'exports' },
  { from: 'Saudi Arabia', to: 'China', value: 89, type: 'exports' },
];

const SANCTIONS_DATA = [
  { target: 'Russia', by: ['US', 'EU', 'UK', 'Japan', 'Australia', 'Canada'], type: 'Comprehensive', sectors: ['Finance', 'Energy', 'Defense', 'Technology'], intensity: 95, since: '2022' },
  { target: 'Iran', by: ['US', 'EU', 'UK'], type: 'Nuclear/JCPOA', sectors: ['Oil', 'Finance', 'Defense', 'Trade'], intensity: 88, since: '2006' },
  { target: 'North Korea', by: ['US', 'EU', 'UN'], type: 'Nuclear', sectors: ['Arms', 'Trade', 'Finance'], intensity: 92, since: '2006' },
  { target: 'Belarus', by: ['US', 'EU', 'UK'], type: 'Political', sectors: ['Finance', 'Trade', 'Technology'], intensity: 60, since: '2020' },
  { target: 'Myanmar', by: ['US', 'EU', 'UK'], type: 'Human Rights', sectors: ['Finance', 'Defense'], intensity: 45, since: '2021' },
  { target: 'Venezuela', by: ['US', 'EU'], type: 'Political', sectors: ['Oil', 'Finance', 'Gold'], intensity: 72, since: '2017' },
  { target: 'Cuba', by: ['US'], type: 'Embargo', sectors: ['Trade', 'Finance', 'Technology'], intensity: 80, since: '1960' },
  { target: 'Syria', by: ['US', 'EU', 'UK', 'Arab League'], type: 'Political', sectors: ['Oil', 'Finance', 'Arms'], intensity: 85, since: '2011' },
];

const LINEAR_REGRESSION = (data: { year: number; value: number }[]) => {
  const n = data.length;
  const xs = data.map((_, i) => i);
  const ys = data.map(d => d.value);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumXX = xs.reduce((s, x) => s + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const predictions = xs.map(x => slope * x + intercept);
  const ssr = ys.reduce((s, y, i) => s + Math.pow(y - predictions[i], 2), 0);
  const stderr = Math.sqrt(ssr / Math.max(n - 2, 1));
  const meanY = sumY / n;
  const sst = ys.reduce((s, y) => s + Math.pow(y - meanY, 2), 0);
  const r2 = 1 - ssr / Math.max(sst, 0.001);
  return { slope, intercept, stderr, r2 };
};

const computeRiskScore = (country: CountryEconData): number => {
  let score = 0;
  score += Math.min(country.militaryPct * 6.5, 35);
  score += Math.min(Math.max(country.inflation - 3, 0) * 1.2, 20);
  score += Math.min(country.unemployment * 1.5, 15);
  score += Math.min(Math.max(country.debtPct - 60, 0) * 0.15, 15);
  if (country.tradeBalance < 0) score += Math.min(-country.tradeBalance / 80, 10);
  if (country.gdpGrowth < 0) score += 5;
  return Math.min(Math.round(score), 100);
};

router.get("/economics/data", async (_req, res) => {
  const enriched = ECONOMICS_DATA.map(c => {
    const reg = LINEAR_REGRESSION(c.growthHistory);
    const lastIdx = c.growthHistory.length;
    const forecastGrowth = [1, 2, 3, 4].map(offset => ({
      year: 2023 + offset,
      value: parseFloat((reg.slope * (lastIdx + offset - 1) + reg.intercept).toFixed(2)),
      lower: parseFloat((reg.slope * (lastIdx + offset - 1) + reg.intercept - 1.96 * reg.stderr).toFixed(2)),
      upper: parseFloat((reg.slope * (lastIdx + offset - 1) + reg.intercept + 1.96 * reg.stderr).toFixed(2)),
    }));
    const gdpReg = LINEAR_REGRESSION(c.gdpHistory);
    const lastGdpIdx = c.gdpHistory.length;
    const forecastGdp = [1, 2, 3, 4].map(offset => ({
      year: 2023 + offset,
      value: parseFloat(Math.max(gdpReg.slope * (lastGdpIdx + offset - 1) + gdpReg.intercept, 0).toFixed(2)),
      lower: parseFloat(Math.max(gdpReg.slope * (lastGdpIdx + offset - 1) + gdpReg.intercept - 1.96 * gdpReg.stderr, 0).toFixed(2)),
      upper: parseFloat(Math.max(gdpReg.slope * (lastGdpIdx + offset - 1) + gdpReg.intercept + 1.96 * gdpReg.stderr, 0).toFixed(2)),
    }));
    return {
      ...c,
      riskScore: computeRiskScore(c),
      forecastGrowth,
      forecastGdp,
      growthTrend: reg.slope > 0.1 ? 'accelerating' : reg.slope < -0.1 ? 'decelerating' : 'stable',
      growthR2: parseFloat(reg.r2.toFixed(3)),
    };
  });

  res.json({
    countries: enriched,
    tradeFlows: TRADE_FLOWS,
    sanctions: SANCTIONS_DATA,
    globalGdp: enriched.reduce((s, c) => s + c.gdp, 0).toFixed(2),
    avgGrowth: (enriched.reduce((s, c) => s + c.gdpGrowth, 0) / enriched.length).toFixed(2),
    avgInflation: (enriched.reduce((s, c) => s + c.inflation, 0) / enriched.length).toFixed(2),
    lastUpdated: new Date().toISOString(),
  });
});

export default router;
