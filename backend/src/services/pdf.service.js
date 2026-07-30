import pdfParse from "pdf-parse";

class PdfExtractionError extends Error {
  constructor(message = "Unable to extract text from the provided PDF.") {
    super(message);
    this.name = "PdfExtractionError";
  }
}

const extractTextFromPdfBuffer = async (buffer) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("PDF buffer must be a Buffer instance.");
  }

  if (buffer.length === 0) {
    throw new PdfExtractionError("The provided PDF buffer is empty.");
  }

  try {
    const data = await pdfParse(buffer);
    const extractedText = data?.text?.trim();

    if (!extractedText) {
      throw new PdfExtractionError(
        "The PDF could not be read or contains no extractable text.",
      );
    }

    return extractedText;
  } catch (error) {
    if (error instanceof PdfExtractionError) {
      throw error;
    }

    throw new PdfExtractionError("Failed to process the PDF buffer.");
  }
};

export { PdfExtractionError, extractTextFromPdfBuffer };
export default extractTextFromPdfBuffer;
