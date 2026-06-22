## ADDED Requirements

### Requirement: 首發價格趨勢折線圖

系統 SHALL 提供首發價格趨勢折線圖，使用資料庫中每筆遊戲資料的發售日作為 X 軸，首發價格作為 Y 軸，呈現 PlayStation 第一方大作首發價格隨時間變化的趨勢。

#### Scenario: 顯示有效價格資料

- **GIVEN** 資料庫中存在包含 `release_date` 與 `price` 的遊戲價格資料
- **WHEN** 使用者開啟網站首頁
- **THEN** 系統 SHALL 依照 `release_date` 由舊到新排序資料
- **AND** 系統 SHALL 在折線圖中顯示每筆資料的價格點位

#### Scenario: 忽略缺少發售日的資料

- **GIVEN** 資料庫中存在缺少 `release_date` 的價格資料
- **WHEN** 系統產生折線圖
- **THEN** 系統 SHALL 不將該筆資料顯示在折線圖中

#### Scenario: 顯示圖表提示資訊

- **GIVEN** 使用者將滑鼠移到折線圖的資料點
- **WHEN** 系統顯示 tooltip
- **THEN** tooltip SHALL 顯示遊戲名稱、平台、發售日與首發價格

### Requirement: 手動修改價格紀錄

系統 SHALL 提供手動修改價格紀錄功能，讓使用者可以補充或修正既有資料的上市日期、版本、價格、來源與備註。

#### Scenario: 修改爬蟲匯入資料的上市日期

- **GIVEN** 資料庫中存在一筆由爬蟲匯入且缺少 `release_date` 的價格紀錄
- **WHEN** 使用者編輯該筆資料並填入上市日期
- **THEN** 系統 SHALL 更新該筆資料的 `release_date`
- **AND** 若該筆資料具有有效的 `release_date` 與 `price`，系統 SHALL 可將其納入首發價格趨勢圖