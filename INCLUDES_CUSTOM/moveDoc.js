/* "Moves" a document from its current record to the supplied record.  (Just changes the associated permit record.)
	Parameters
		docModel - DocumentModel object of the document to be moved
		newCap - CapIdModel of the record to move the document to
		newStatus (optional) - String of the document status to set on the document after moving
		newDesc (optional) - String of the document description to set on the document after moving
	Returns int 1 if document moved successfully
	Or "Error" and then the issue if there was an error/exception
*/
function moveDoc (docModel, newCap, newStatus, newDesc) {
	try {
		if (docModel == null || newCap == null || typeof docModel == "undefined" || typeof newCap == "undefined") {
			return "Error: Invalid parameter passed to moveDoc; docModel: " + docModel + ", newCap: " + newCap;
		}
		
		var newCapIds = newCap.ID1 + "-" + newCap.ID2 + "-" + newCap.ID3;
		var sqlUpd = "update XDOCUMENT_ENTITY ";
		var today = new Date();
		var jDate = aa.util.parseDate((today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear());
		var updResult;
		var itemCap = docModel.capID;  // Current permit record, only used for exception reporting
		var docSeq = getDocumentSeqNbr(docModel);
		
		// Set and update document object
		docModel.setCapID(newCap);
		docModel.setEntityID(newCapIds);
		
		// Update the document status if one specified
		if (typeof newStatus != "undefined" && newStatus != null) {
			docModel.setDocStatus(newStatus);
			docModel.setDocStatusDate(jDate);
		}

		// Update the document description if one specified
		if (typeof newDesc != "undefined" && newDesc != null) {
			docModel.setDocDescription(newDesc);
		}
		
		aa.document.updateDocument(docModel);
		
		// Now for the SQL, need to change the XDOCUMENT_ENTITY record or doc will appear on both permit records
		sqlUpd += "set ENT_ID = '" + newCapIds + "' where SERV_PROV_CODE = '" + aa.serviceProviderCode + "' and DOC_SEQ_NBR ='" + docSeq + "'";

		try {
			updResult = aa.db.update(sqlUpd, []);
			
			if (updResult.success == false) {
				return "Error: Unable to completely move document " + docModel + ": " + updResult.errorMessage;
			}
		}
		catch (err) {
			return "Error moving document " + docModel.docName + ": " + err;
		}
		
		return 1;
	}
	catch (err) {
		return "Error moving document " + docModel.docName + ": " + err;
	}
}

function getDocumentSeqNbr(docModel)
{
	var docSeq = docModel.getDocumentNo();
	logDebug("Doc Seq: " + docSeq);

	return docSeq;
}
