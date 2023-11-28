/**
* @NScriptType UserEventScript
* @NApiVersion 2.1
*
*/
define(['N/currentRecord', 'N/log', 'N/error', 'N/runtime', 'N/search'], function (record, log, error, runtime, search) {
  const ITEMSUBLIST = 'item';
  const EXPSUBLIST = 'expense';
  const LINESUBLIST = 'line';
  function beforeSubmit(context) {
    const rec = context.newRecord;
    const recType = rec.getValue ({
        fieldId: 'baserecordtype'
    });
    if (recType == 'advintercompanyjournalentry') {
      const lineCountItem = rec.getLineCount ({
        sublistId: LINESUBLIST
      });
      if (lineCountItem > 0) {
        processDeptClassCheck(rec, LINESUBLIST, lineCountItem);
      }
    } else if (recType == 'cashsale') {
      const lineCountItem = rec.getLineCount ({
        sublistId: ITEMSUBLIST
      });
      if (lineCountItem > 0) {
        processDeptClassCheck(rec, ITEMSUBLIST, lineCountItem);
      }
    } else if (recType == 'check') {
      const lineItem = rec.getLineCount ({
        sublistId: ITEMSUBLIST
      });
      if (lineItem > 0) {
        processDeptClassCheck(rec, ITEMSUBLIST, lineItem);
      }
      const lineExpense = rec.getLineCount ({
        sublistId: EXPSUBLIST
      });
      if (lineExpense > 0) {
        processDeptClassCheck(rec, EXPSUBLIST, lineExpense);
      }

    } else if (recType == 'creditmemo') {
      const lineItem = rec.getLineCount ({
        sublistId: ITEMSUBLIST
      });
      if (lineItem > 0) {
        processDeptClassCheck(rec, ITEMSUBLIST, lineItem);
      }

    } else if (recType == 'estimate') {
      const lineItem = rec.getLineCount ({
        sublistId: ITEMSUBLIST
      });
      if (lineItem > 0) {
        processDeptClassCheck(rec, ITEMSUBLIST, lineItem);
      }

    } else if (recType == 'inventoryadjustment') {
      const lineItem = rec.getLineCount ({
        sublistId: 'inventory'
      });
      if (lineItem > 0) {
        processDeptClassCheck(rec, 'inventory', lineItem);
      }

    }else if (recType == 'invoice') {
      const lineItem = rec.getLineCount ({
        sublistId: ITEMSUBLIST
      });
      if (lineItem > 0) {
        processDeptClassCheck(rec, ITEMSUBLIST, lineItem);
      }

    } else if (recType == 'journalentry') {
      const lineCountItem = rec.getLineCount ({
        sublistId: LINESUBLIST
      });
      if (lineCountItem > 0) {
        processDeptClassCheck(rec, LINESUBLIST, lineCountItem);
      }

    } else if (recType == 'purchaseorder') {
      const lineItem = rec.getLineCount ({
        sublistId: ITEMSUBLIST
      });
      if (lineItem > 0) {
        processDeptClassCheck(rec, ITEMSUBLIST, lineItem);
      }
      const lineExpense = rec.getLineCount ({
        sublistId: EXPSUBLIST
      });
      if (lineExpense > 0) {
        processDeptClassCheck(rec, EXPSUBLIST, lineExpense);
      }

    } else if (recType == 'vendorreturnauthorization') {
      const lineItem = rec.getLineCount ({
        sublistId: ITEMSUBLIST
      });
      if (lineItem > 0) {
        processDeptClassCheck(rec, ITEMSUBLIST, lineItem);
      }
      const lineExpense = rec.getLineCount ({
        sublistId: EXPSUBLIST
      });
      if (lineExpense > 0) {
        processDeptClassCheck(rec, EXPSUBLIST, lineExpense);
      }

    } else if (recType == 'salesorder') {
      const lineItem = rec.getLineCount ({
        sublistId: ITEMSUBLIST
      });
      if (lineItem > 0) {
        processDeptClassCheck(rec, ITEMSUBLIST, lineItem);
      }

    } else if (recType == 'statisticaljournalentry') {
      const lineCountItem = rec.getLineCount ({
        sublistId: LINESUBLIST
      });
      if (lineCountItem > 0) {
        processDeptClassCheck(rec, LINESUBLIST, lineCountItem);
      }

    } else if (recType == 'transferorder') {
      const lineItem = rec.getLineCount ({
        sublistId: ITEMSUBLIST
      });
      if (lineItem > 0) {
        processDeptClassCheck(rec, ITEMSUBLIST, lineItem);
      }

    } else if (recType == 'vendorbill') {
      const lineItem = rec.getLineCount ({
        sublistId: ITEMSUBLIST
      });
      if (lineItem > 0) {
        processDeptClassCheck(rec, ITEMSUBLIST, lineItem);
      }
      const lineExpense = rec.getLineCount ({
        sublistId: EXPSUBLIST
      });
      if (lineExpense > 0) {
        processDeptClassCheck(rec, EXPSUBLIST, lineExpense);
      }

    } else if (recType == 'vendorcredit') {
      const lineItem = rec.getLineCount ({
        sublistId: ITEMSUBLIST
      });
      if (lineItem > 0) {
        processDeptClassCheck(rec, ITEMSUBLIST, lineItem);
      }
      const lineExpense = rec.getLineCount ({
        sublistId: EXPSUBLIST
      });
      if (lineExpense > 0) {
        processDeptClassCheck(rec, EXPSUBLIST, lineExpense);
      }

    }
  }

  function processDeptClassCheck(rec, SUBID, lineCountItem) {
    let departmentList = [];
    for (let i = 0; i < lineCountItem; i += 1) {
      const deptId = rec.getSublistValue ({
        sublistId: SUBID,
        fieldId: 'department',
        line: i
      });
      departmentList.push(deptId);
      const classId = rec.getSublistValue ({
        sublistId: SUBID,
        fieldId: 'custcol_mhi_line_class',
        line: i
      });
      rec.setSublistValue ({
        sublistId: SUBID,
        fieldId: 'class',
        value: classId,
        line: i
      });
    }
    departmentList = [...new Set(departmentList)];

    //check if department is parent or not
    const deptSearch = search.load({
      id: 'customsearch_mhi_department_search'
    });
    deptSearch.filters.push(search.createFilter({
      name: 'internalid',
      operator: search.Operator.ANYOF,
      values: departmentList
    }));
    const deptResults = getAllSearchResults(deptSearch.run());
    if (deptResults.length > 0) {
      throw 'Parent Department is not allowed'
    }
  }

  function getAllSearchResults(searchResult) {
    let arrResults = [];
    let resultSet = [];
    const MAX_SEARCH_SIZE = 1000;
    let count = 0;

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

  return{
      beforeSubmit: beforeSubmit,
  }
})
