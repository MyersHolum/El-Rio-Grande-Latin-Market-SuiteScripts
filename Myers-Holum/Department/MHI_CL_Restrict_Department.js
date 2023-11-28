/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 *
 */
define(['N/currentRecord', 'N/record', 'N/search'], function(currentRecord, record, search) {
  var departmentList = [];

  function pageInit(context) {
    var deptSearch = search.load({
      id: 'customsearch_mhi_department_search'
    });
    var deptResults = getAllSearchResults(deptSearch.run());
    for (var i = 0; i < deptResults.length; i += 1) {
      var deptId = deptResults[i].getValue ({
        name: 'internalid',
      });
      departmentList.push(deptId);
    }
  }

  function fieldChanged(context) {
    var rec = context.currentRecord;
    var recType = rec.getValue ({
        fieldId: 'baserecordtype'
    });
    var sublistName = context.sublistId;
    if (recType == 'advintercompanyjournalentry' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    } else if (recType == 'cashsale' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    } else if (recType == 'check' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    } else if (recType == 'creditmemo' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    } else if (recType == 'estimate' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    } else if (recType == 'inventoryadjustment' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    } else if (recType == 'invoice' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    }else if (recType == 'journalentry' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    } else if (recType == 'purchaseorder' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    } else if(recType == 'vendorreturnauthorization' && context.fieldId == 'department'){
      validateDept(rec, sublistName);

    } else if (recType == 'salesorder' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    } else if (recType == 'statisticaljournalentry' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    } else if (recType == 'transferorder' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    }else if (recType == 'vendorbill' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    }else if (recType == 'vendorcredit' && context.fieldId == 'department') {
      validateDept(rec, sublistName);

    }
  }

  function validateDept(rec, SUBID) {
    var dept = rec.getCurrentSublistValue ({
      sublistId: SUBID,
      fieldId: 'department'
    }) || '';
    var deptName = rec.getCurrentSublistText ({
      sublistId: SUBID,
      fieldId: 'department'
    }) || '';
    if (!isEmpty(dept) && departmentList.indexOf(dept) != -1) {
      alert ('Can not select "'+deptName+'" parent Department');
      rec.setCurrentSublistValue ({
        sublistId: SUBID,
        fieldId: 'department',
        value: ''
      });
    }
  }
  function isEmpty(thisVar) {
    return (
      thisVar === '' ||
      thisVar == null ||
      thisVar == undefined ||
      (thisVar.constructor === Array && thisVar.length == 0) ||
      (thisVar.constructor === Object && Object.keys(thisVar).length === 0)
    );
  }

  function getAllSearchResults(searchResult) {
    var arrResults = [];
    var resultSet = [];
    var MAX_SEARCH_SIZE = 1000;
    var count = 0;
    do {
      resultSet = searchResult.getRange({
        start: count,
        end: count + MAX_SEARCH_SIZE
      });
      arrResults = arrResults.concat(resultSet);
      count += MAX_SEARCH_SIZE;
    } while (resultSet.length > 0);
    return arrResults;
  }

  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged
  };

});