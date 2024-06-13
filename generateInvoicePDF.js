/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/render', 'N/record', 'N/error', 'N/file'], function (render, record, error, file) {

    function _getInvoicePDFContent(invoiceId) {
        try {
            var numericInvoiceId = parseInt(invoiceId, 10);
            if (isNaN(numericInvoiceId)) {
                throw error.create({
                    name: 'INVALID_INVOICE_ID',
                    message: 'The provided Invoice ID must be a valid number.',
                });
            }

            var pdfFile = render.transaction({
                entityId: numericInvoiceId,
                printMode: render.PrintMode.PDF,
            });

            // Save the PDF to the file cabinet
            var fileId = _savePdfToFileCabinet(pdfFile, numericInvoiceId);

            // Generate a public URL for the saved PDF
            var fileObj = file.load({
                id: fileId
            });

            return fileObj.url;

        } catch (e) {
            var errorMessage = 'Failed to generate PDF for Invoice ID ' + invoiceId + ': ' + e.message;
            throw error.create({
                name: 'PDF_GENERATION_FAILED',
                message: errorMessage,
                notifyOff: false
            });
        }
    }

    function _savePdfToFileCabinet(pdfFile, invoiceId) {
        var fileName = 'Invoice_' + invoiceId + '.pdf';
        pdfFile.name = fileName;
        pdfFile.folder = 123; // Replace 123 with your file cabinet folder ID
        pdfFile.isOnline = true; // Make the file available online

        return pdfFile.save(); // Returns the file ID after saving
    }

    function doGet(requestParams) {
        var invoiceId = requestParams.invoice_id;
        if (!invoiceId) {
            throw error.create({
                name: 'INVALID_INVOICE_ID',
                message: 'Invoice ID is required',
            });
        }

        var pdfUrl = _getInvoicePDFContent(invoiceId);

        // Return the URL in a JSON object
        return JSON.stringify({ url: pdfUrl });
    }

    return {
        get: doGet
    };
});
