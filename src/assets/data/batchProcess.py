import json

array = [2,4,5,7,8,10,12,16,20,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,83,84,85,86,90,91,95,98,99,104,109,110,116,117,118,119,120,121,123,126,127,128,129,131,133,135,136,137,138,140,142,144,145,146,148,150,151,152,153,155,157,159,163,168,169,170,173,174,175,176,180,181,183,185,188,193,194,195,196,197,198,199,201,202,203,204,205,206,207,208,211,212,213,214,215,216,217,220,221,223,225,226,227,228,233,234,235,236,239,240,245,247,254,267,268,275,278,279,293,295,297,298,302,303,304,306,307,308,312,313,314,315,319,322,325,327,328,329,330,333,342,344,345,346,348,350,351,355,362,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,388,389,391,392,393,394,397,398,399,402,406,407,408,409,410,411,413,418,419,426,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,445,449,453,454,455,457,461,462,463,464,465,466,467,468,476,486,487,488,489,490,491,492,493,494,495,496,497,498,499,523,525,528,529,535,539,541,542,543,545,547,549,555,557,559,560,563,569,570,572,582,583,585,586,587,588,589,590,593,599,602,604,605,607,609,610,615,616,618,622,623,624,625,626,627,628,642,650,662,665,669,670,672,673,674,675,680,681,684,685,688,691,692,695,696,697,699,700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,801,803,804,805,809,810,811,812,814,829,832,833,834,835,836,837,838,874,876,877,879,880,881,889,890,901,902,905,907,908,910,911,912,913,915,916,921,925,927,932,938,939,940,941,942,943,944,945,948,952,966,975,978,982,986,997,999,1000,1003,1005,1007,1013,1020,1022,1027,1028,1029,1031,1032,1034,1035,1036,1037,1041,1042,1043,1044,1047,1048,1050,1052,1053,1057,1058,1061,1062,1063,1064,1065,1067,1068,1069,1070,1073,1074,1078,1079,1081,1083,1088,1090,1095,1096,1097,1098,1099,1100,1101,1103,1104,1105,1107,1111,1112,1113,1123,1125,1126,1127,1128,1129,1131,1135,1136,1137,1138,1139,1140,1143,1146,1149,1150,1153,1155,1156,1157,1161,1162,1167,1169,1171,1173,1174,1178,1179,1182,1183,1188,1189,1195,1200,1208,1213,1223,1224,1227,1228,1229,1231,1233,1234,1238,1252,1269,1270,1271,1272,1273,1274,1275,1276,1277,1278,1279,1280,1281,1282,1283,1284,1285,1286,1287,1288,1289,1290,1291,1292,1293,1294,1295,1296,1297,1298,1299,1300,1301,1302,1303,1304,1305,1306,1307,1308,1309,1310,1311,1312,1313,1314,1315,1316,1317,1318,1319,1320,1321,1322,1323,1324,1325,1326,1327,1328,1329,1330,1331,1332,1333,1334,1336,1337,1340,1341,1342,1343,1350,1353,1354,1356,1359,1360,1364,1365,1366,1367,1373,1374,1375,1376,1380,1381,1382,1383,1384,1385,1386,1387,1389,1393,1395,1397,1400,1405,1407,1414,1415,1420,1422,1423,1424,1426,1429,1435,1440,1441,1445,1448,1449,1450,1451,1452,1453,1457,1459,1460,1461,1464,1466,1468,1470,1471,1473,1475,1477,1478,1479,1480,1483,1484,1485,1486,1489,1491,1492,1493,1496,1498,1500,1501,1502,1504,1509,1510,1511,1513,1515,1517,1518,1519,1520,1521,1524,1532,1534,1535,1536,1537,1538,1539,1540,1541,1542,1543,1545,1548,1549,1550,1552,1553,1554,1555,1556,1558,1559,1560,1561,1562,1565,1566,1567,1568,1569,1571,1575,1579,1580,1585,1590,1596,1597,1601,1602,1603,1606,1607,1611,1612,1613,1614,1615,1618,1623,1636,1643,1648,1650,1651,1652,1653,1654,1660,1662,1663,1668,1670,1671,1674,1675,1679,1680,1683,1689,1690,1691,1694,1703,1710,1715,1718,1721,1723,1729,1732,1737,1738,1743,1744,1747,1755,1762,1766,1767,1778,1779,1786,1787,1794,1795,1796,1801,1802,1803,1806,1807,1808,1809,1810,1811,1813,1814,1816,1817,1830,1836,1839,1849,1852,1853,1867,1872,1873,1883,1892,1895,1896,1898,1900,1905,1907,1909,1912,1913,1914,1917,1919,1920,1922,1923,1931,1936,1937,1938,1941,1947,1950,1955,1956,1958,1960,1961,1962,1965,1966,1970,1975,1977,1979,1981,1982,1983,1991,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2027,2032,2034,2043,2045,2048,2055,2071,2073,2077,2081,2082,2084,2085,2087,2093,2096,2097,2098,2099,2103,2106,2107,2108,2109,2113,2116,2117,2118,2119,2120,2121,2124,2125,2126,2127,2128,2129,2131,2132,2138,2139,2142,2143,2145,2146,2147,2148,2149,2151,2152,2153,2156,2157,2166,2167,2168,2170,2173,2174,2177,2178,2184,2185,2187,2188,2190,2191,2192,2193,2194,2196,2197,2198,2209,2211,2212,2213,2214,2215,2216,2217,2218,2222,2225,2228,2229,2232,2238,2239,2240,2241,2242,2243,2244,2246,2247,2252,2253,2254,2259,2260,2266,2267,2270,2273,2274,2275,2276,2277,2278,2281,2282,2287,2291,2292,2293,2294,2302,2303,2309,2311,2312,2315,2319,2320,2321,2322,2323,2324,2325,2328,2329,2330,2331,2332,2333,2341,2343,2344,2347,2349,2350,2356,2358,2359,2363,2364,2366,2368,2369,2370,2371,2376,2377,2378,2381,2382,2384,2385,2386,2388,2390,2392,2395,2397,2398,2403,2405,2406,2407,2408,2413,2415,2416,2417,2418,2419,2422,2424,2425,2426,2427,2428,2429,2430,2431,2432,2433,2434,2435,2437,2438,2440,2442,2443,2444,2445,2446,2447,2448,2449,2450,2451,2452,2453,2454,2455,2456,2457,2458,2459,2460,2461,2462,2463,2464,2465,2466,2467,2468,2469,2470,2471,2472,2473,2474,2475,2476,2477,2478,2483,2484,2485,2486,2487,2488,2490,2492,2493,2494,2495,2497,2498,2500,2501,2502,2504,2507,2508,2509,2510,2511,2512,2513,2514,2516,2517,2518,2519,2521,2526,2527,2529,2530,2531,2532,2533,2534,2535,2539,2541,2542,2543,2545,2546,2547,2551,2553,2564,2568,2576,2580,2582,2584,2585,2594,2607,2611,2618,2631,2633,2634,2635,2636,2639,2642,2647,2652,2656,2658,2659,2660,2663,2664,2666,2673,2679,2680,2681,2682,2684,2686,2687,2690,2692,2694,2697,2698,2701,2703,2704,2709,2711,2712,2713,2714,2715,2716,2717,2718,2719,2720,2721,2722,2724,2725,2727,2729,2730,2732,2734,2736,2738,2739,2741,2742,2743,2745,2746,2748,2749,2750,2751,2752,2753,2754,2755,2757,2759,2760,2762,2763,2764,2765,2766,2767,2768,2769,2770,2771,2772,2773,2777,2778,2779,2781,2782,2783,2784,2790,2791,2792,2793,2794,2795,2801,2808,2809,2810,2811,2816,2819,2820,2821,2822,2823,2824,2825,2827,2830,2832,2833,2839,2840,2841,2848,2849,2850,2851,2852,2853,2854,2855,2856,2857,2858,2859,2860,2861,2862,2863,2864,2865,2866,2867,2868,2869,2870,2871,2872,2873,2874,2881,2883,2889,2890,2898,2901,2902,2903,2904,2905,2906,2910,2914,2917,2918,2919,2924,2925,2927,2929,2930,2931,2938,2939,2942,2944,2946,2947,2948,2949,2950,2951,2952,2953,2954,2955,2956,2957,2958,2959,2960,2961,2962,2963,2964,2965,2966,2967,2968,2969,2970,2971,2972,2973,2974,2975,2976,2977,2978,2979,2980,2981,2982,2983,2984,2985,2986,2987,2988,2990,2991,2992,2993,2994,2995,2996,3004,3013,3014,3015,3017,3018,3019,3021,3022,3023]

with open('coursesCopy.json') as f:
    data = json.load(f)

for item in data:
    for j in array:
        if item['id'] == j or item['id'] == str(j):
            #print(j)
            item['isActive'] = "False"

with open('newCourses.json', 'w') as f:
    json.dump(data, f)
