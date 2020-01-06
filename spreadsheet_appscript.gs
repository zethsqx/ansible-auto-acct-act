function doGet(e) {
  //e = {"parameter":{"op":"add","key":"11111111111", "expiry":"11111111111"}}
  //e = {"parameter":{"op":"activate","key":"11111111111"}}
  //e = {"parameter":{"op":"query","key":"11111111111"}}
  //e = {"parameter":{"op":"delete","key":"11111111111"}}
  Logger.log(JSON.stringify(e));
  if (e.parameter.op == "add") {
    var actKey = e.parameter.key;
    var expiryDate = e.parameter.expiry;
    var params = JSON.parse(addUserActKey(actKey, expiryDate));
    return HtmlService.createHtmlOutput(JSON.stringify(params).toString());
  } else if (e.parameter.op == "activate"){
    try{
      var actKey = e.parameter.key;
      var result = activateUser(actKey)
      return HtmlService.createHtmlOutput((result).toString() + "<script>setTimeout(function(){window.top.location.href='***REMOVED***'}, 5000);</script>");
    } catch (ex) {
      return HtmlService.createHtmlOutput("Opppps. Something is wrong.");
    }
  } else if (e.parameter.op == "query") {
    var actKey = e.parameter.key;
    var params = JSON.parse(getTable());
    return ContentService.createTextOutput().setContent("<result>" + params.data[actKey][1] + "</result>");
  } else if (e.parameter.op == "delete") {
    var actKey = e.parameter.key;
    return HtmlService.createHtmlOutput(deleteRecord(actKey));
  }
}

function addUserActKey(a,b) {
  // Append to the last row > key and expiry
  var spreadsheetId = '***REMOVED***';
  var range = 'Key List!A:B';
  var values = [
    [
    a, b
    ]
  ];
  
  var valueRange = Sheets.newRowData();
  valueRange.values = values;
  Logger.log(valueRange);
  
  var optionalArgs = {valueInputOption: "USER_ENTERED"};
  return Sheets.Spreadsheets.Values.append(valueRange, spreadsheetId, range, optionalArgs);
}

function getTable() {
  // Retrieve the whole table > loop and find the key > return the whole json
  var spreadsheetId = '***REMOVED***';
  var rangeName = 'Key List!A2:C';
  var values = Sheets.Spreadsheets.Values.get(spreadsheetId, rangeName).values;
  if (!values) {
    Logger.log('No data found.');
  } else {
    var result = ""
    for (var row = 0; row < values.length; row++) {
      // Print columns A and B, which correspond to indices 0 and 1.
        if (row == values.length -1){
          result = result + '"' + values[row][0] + '":["' + values[row][1] + '","' + values[row][2] + '"]';
        }else{
          result = result + '"' + values[row][0] + '":["' + values[row][1] + '","' + values[row][2] + '"],';
        }
    }
    var jsonStr = '{"data":{' + result + '}}';
    return jsonStr;
  }
}

function setState(e,s)
{
  // Retrieve the whole table > loop and find the key > return the row number
  var searchString = e;
  var spreadsheetId = '***REMOVED***';
  var rangeName = 'Key List!A2:C';
  var values = Sheets.Spreadsheets.Values.get(spreadsheetId, rangeName).values;
  if (!values) {
    Logger.log('No data found.');
  } else {
    var rowNum = ""
    for (var row = 0; row < values.length; row++) {
      if (values[row][0] == e){
        
        // Use the row num > do edit on the state column
        var changeValues = [
          [
            s
          ]
        ];
        var valueRange = Sheets.newRowData();
        valueRange.values = changeValues;
        var optionalArgs = {valueInputOption: "USER_ENTERED"};
        var rangetoEdit = 'Key List!C' + (row + 2);
        return Sheets.Spreadsheets.Values.update(valueRange, spreadsheetId, rangetoEdit, optionalArgs);
      }
    }
  }
}

function activateUser(actKey){
  var params = JSON.parse(getTable());
  var expireOn = params.data[actKey][0]
  var currDatetime = Math.round((new Date()).getTime() / 1000);
  if ( currDatetime < expireOn) {
    setState(actKey, "A"); 
    return "Account activated. You will be redirected shortly or visit <a href='***REMOVED***'>***REMOVED***</a>"
  } else {
    setState(actKey, "E");
    return "Account activation has expired. Request again."
  }
}

function deleteRecord(actKey){
  var spreadsheetId = '***REMOVED***';
  var rangeName = 'Key List!A2:C';
  var values = Sheets.Spreadsheets.Values.get(spreadsheetId, rangeName).values;
  if (!values) {
    Logger.log('No data found.');
  } else {
    var rowNum = ""
    for (var row = 0; row < values.length; row++) {
      if (values[row][0] == actKey){
          Logger.log(values[row][0]);
          Logger.log(actKey);
          Logger.log(row);
      
          var gridRange = Sheets.newGridRange();
          gridRange.sheetId = 0;
          gridRange.startRowIndex = row+1;
          gridRange.endRowIndex = row+2;
          gridRange.startColumnIndex = 0;
          gridRange.endColumnIndex = 3;
          
          var deleteRangeReq = Sheets.newDeleteRangeRequest();
          deleteRangeReq.range = gridRange;
          deleteRangeReq.shiftDimension = "ROWS"
          
          var reqObj = Sheets.newRequest();
          reqObj.deleteRange = deleteRangeReq;
          
          var batchReqObj = Sheets.newBatchUpdateSpreadsheetRequest();
          batchReqObj.requests = [reqObj];
          batchReqObj.responseIncludeGridData = true;
          batchReqObj.includeSpreadsheetInResponse = true;
          batchReqObj.responseRanges = ["true"]
          
          return Sheets.Spreadsheets.batchUpdate(batchReqObj, spreadsheetId);
      }
    }
  }
}





