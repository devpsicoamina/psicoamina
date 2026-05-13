import { FileText, AlertTriangle } from 'lucide-react'

export default function PDFConsentModal({ open, onAccept, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg z-10 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-primary-50 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary-600">Antes de anexar o PDF</h2>
            <p className="text-sm text-secondary mt-1">Confirmação única para envio de documentos à IA.</p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-sm text-text-primary leading-relaxed">
          <p>
            Para responder com base no seu PDF, o conteúdo textual será extraído no seu navegador
            e enviado à <strong>OpenAI</strong> como parte da conversa com o agente.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-amber-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Recomendações importantes
            </p>
            <ul className="text-amber-900 text-[13px] space-y-1.5 list-disc pl-5">
              <li>
                <strong>Anonimize</strong> nomes, CPFs, datas de nascimento e qualquer identificador
                de pacientes antes de enviar.
              </li>
              <li>
                Não envie documentos com dados sensíveis de menores sem autorização dos
                responsáveis.
              </li>
              <li>
                Você é a titular responsável pelos dados que compartilha — a OpenAI declara não usar
                dados via API para treinar modelos, mas eles transitam pela infraestrutura deles.
              </li>
            </ul>
          </div>

          <p className="text-xs text-secondary">
            Esta confirmação aparece uma vez. Detalhes na{' '}
            <a
              href="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 font-semibold hover:underline"
            >
              Política de Privacidade
            </a>.
          </p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-gray-200 text-text-primary py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onAccept}
            className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button"
          >
            Aceito e quero continuar
          </button>
        </div>
      </div>
    </div>
  )
}
