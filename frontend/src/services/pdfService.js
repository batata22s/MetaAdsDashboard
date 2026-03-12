/**
 * Service to generate professional PDF reports using native browser printing
 */
class PdfService {
    /**
     * Triggers the native browser print dialog
     * This is the most "native" and robust way to generate a PDF
     */
    async generate(elementId, fileName = 'Triadmarkets Dashboard') {
        // Set the document title temporarily as it defines the default filename in many browsers
        const originalTitle = document.title;
        document.title = fileName;

        // Small delay to ensure any state changes are rendered
        document.body.classList.add('is-printing');
        document.body.setAttribute('data-print-target', elementId);

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Trigger the native print dialog
            window.print();
        } catch (error) {
            console.error('Error triggering print:', error);
            alert('Erro ao abrir o seletor de impressão. Tente usar as teclas de atalho (Ctrl + P).');
        } finally {
            // Restore original title
            document.title = originalTitle;
            document.body.classList.remove('is-printing');
            document.body.removeAttribute('data-print-target');
        }
    }
}

export default new PdfService();
