/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/search'],
 /**
  * @param {record} record
  * @param {redirect} redirect
  * @param {runtime} runtime
  */
 function(record, search) {
  function beforeSubmit(context) {
    if (context.type == 'delete' || context.type == 'xedit') return;
    const pfaRec = context.newRecord;
    const pfaRecId = pfaRec.id;
    const oldRec = context.oldRecord;
    const oldStatus = context.type != 'create' ? oldRec.getValue('custrecord_2663_file_processed') : '';
    const newStatus = pfaRec.getValue({
      fieldId: 'custrecord_2663_file_processed'
    });
    const MARKED_TRAN = 15;
    const QUEUED = 1;
    const PAYMENT_FILE = 3;
    if(newStatus == MARKED_TRAN || oldStatus == QUEUED && newStatus == PAYMENT_FILE){
      const bankDetailObj = getBankAcc();
      const payemntSearch = search.load({
        id: 'customsearch_mhi_bill_eft_payment_info'
      });
      payemntSearch.filters.push(search.createFilter({
        name: 'custrecord_2663_eft_file_id',
        operator: search.Operator.ANYOF,
        values: pfaRecId
      }));
      const results = getAllSearchResults(payemntSearch.run());
      const finalObj = getObjDetails(results, bankDetailObj);      
      pfaRec.setValue({
        fieldId: 'custrecord_2663_tran_rec_detail',
        value: JSON.stringify(finalObj.refmap)
      });
      pfaRec.setValue({
        fieldId: 'custrecord_2663_trailer_rec_detail',
        value: JSON.stringify(finalObj.tranmap)
      });
    }
  }
  
  function getObjDetails(results, bankDetailObj) {
    let tranCode = '';
    const tranCancel = 320;
    const tranVoid = 430 
    let refmap = {};
    let tranmap = {};
    for (let i = 0; i < results.length; i += 1) {
      const internalId = results[i].getValue({
        name: 'internalid',
        join: 'custrecord_2663_parent_payment',
        summary: 'GROUP'
      });
      const bankID = results[i].getValue({
        name: 'custbody_11187_pref_entity_bank',
        join: 'custrecord_2663_parent_payment',
        summary: 'GROUP'
      });
      const name = results[i].getText({
        name: 'entity',
        join: 'custrecord_2663_parent_payment',
        summary: 'GROUP'
      });
      const tranDate = results[i].getValue({
        name: 'trandate',
        join: 'custrecord_2663_parent_payment',
        summary: 'GROUP'
      });
      const checkIssue = results[i].getValue({
        name: 'tranid',
        join: 'custrecord_2663_parent_payment',
        summary: 'GROUP'
      });
      let tranAmt = results[i].getValue({
        name: 'fxamount',
        join: 'custrecord_2663_parent_payment',
        summary: 'AVG'
      });
      const status = results[i].getText({
        name: 'statusref',
        join: 'custrecord_2663_parent_payment',
        summary: 'GROUP'
      });
      // log.debug('internalId', internalId);
      // log.debug('entityBankDetail', entityBankID);
      // log.debug('name', name);
      // log.debug('tranDate', tranDate);
      // log.debug('checkIssue', checkIssue);
      // log.debug('tranAmt', tranAmt);
      const entityBankID = bankDetailObj[bankID];
      if (tranAmt < 0) {
        tranAmt = tranAmt * -1;
      }
      if (status == 'Voided') {
        tranCode = tranVoid;
      } else {
        tranCode = tranCancel
      }
      var currentBillData = {
        'cs': checkIssue,
        'id': tranDate,
        'tc': tranCode,
        'am': tranAmt,
        'en': name
      };
      if (entityBankID in refmap) {
        refmap[entityBankID].push(currentBillData);
        tranmap[entityBankID].ct += 1;
        tranmap[entityBankID].tm += tranAmt;
      } else {
        refmap[entityBankID] = [currentBillData];
        const tranBillData = {
          'ct': 1,
          'tm': tranAmt
        }
        tranmap[entityBankID] = tranBillData;
      }
      log.debug('tranmap', tranmap);
    };
    log.debug('refmap', refmap);
    log.debug('tranmap', tranmap);
    return {'refmap': refmap, 'tranmap': tranmap}
  }

  function getBankAcc() {
    const bankNoObj = {};
    const bankDetailSearch = search.load({
      id: 'customsearch_mhi_bank_details'
    });
    const bankResults = getAllSearchResults(bankDetailSearch.run());
    log.debug('bankResults', bankResults);
    for (let i = 0; i < bankResults.length; i += 1) {
      const bankId = bankResults[i].getValue({
        name: 'internalid',
      });
      const bankAccNo = bankResults[i].getValue({
        name: 'custrecord_2663_entity_acct_no',
      });
      if (!bankNoObj.bankId) {
        bankNoObj[bankId] = bankAccNo;
      }
    }
    log.debug('bankNoObj', bankNoObj);
    return bankNoObj;
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

   function isEmpty(thisVar) {
    return (
      thisVar === '' ||
      thisVar == null ||
      thisVar == undefined ||
      (thisVar.constructor === Array && thisVar.length == 0) ||
      (thisVar.constructor === Object && Object.keys(thisVar).length === 0)
    );
  }

  return {
    beforeSubmit: beforeSubmit
  };
});