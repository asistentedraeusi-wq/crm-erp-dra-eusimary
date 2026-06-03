import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import type { ResultadosComposicion } from '../../../types/historia-clinica';
import { calcularComposicion } from '../../../lib/calculadora/composicion-corporal';
import ResultCard from '../ui/ResultCard';

interface Props {
  form: HistoriaClinicaForm;
  onTransferir: (r: ResultadosComposicion) => void;
}

export default function TeleCalc({ form, onTransferir }: Props) {
  const peso    = parseFloat(form.tp);
  const talla   = parseFloat(form.th);
  const edad    = parseFloat(form.ta);
  const cintura = parseFloat(form.tw);
  const cadera  = parseFloat(form.thip);
  const cuello  = parseFloat(form.tn);

  const resultados = calcularComposicion({
    peso, talla, edad,
    sexo: form.ts || 'F',
    cintura, cadera, cuello,
    pantorrilla: form.tc ? parseFloat(form.tc) : undefined,
  });

  if (!resultados) {
    return (
      <div style={{
        background: '#F9FAFB', borderRadius: '10px', border: '1px dashed #D4AF37',
        padding: '16px', textAlign: 'center',
      }}>
        <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
          Completa peso, talla, edad, cintura y cuello para ver los calculos en tiempo real
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: '#E6FAF5', borderRadius: '12px', padding: '16px', border: '1px solid #12C49A33' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#0A3D2E', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
          Calculos antropometricos — Tiempo real
        </p>
        <button
          type="button"
          onClick={() => onTransferir(resultados)}
          style={{
            background: '#12C49A', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '6px 14px',
            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
          }}
        >
          Transferir datos al formulario
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        <ResultCard
          value={String(resultados.bmi)}
          label="IMC (kg/m²)"
          category={resultados.bmiCat[0]}
          categoryColor={resultados.bmiCat[1]}
        />
        <ResultCard
          value={`${resultados.bf}%`}
          label="% Grasa corp."
          category={resultados.bfCat[0]}
          categoryColor={resultados.bfCat[1]}
        />
        <ResultCard
          value={`${resultados.fkg} kg`}
          label="Masa grasa"
        />
        <ResultCard
          value={`${resultados.lkg} kg`}
          label="Masa magra"
        />
        <ResultCard
          value={`${resultados.lpct}%`}
          label="% Masa magra"
        />
        <ResultCard
          value={`${resultados.wtr} L`}
          label="Agua corporal"
        />
        <ResultCard
          value={String(resultados.wth)}
          label="Indice C/T"
          category={resultados.wthCat[0]}
          categoryColor={resultados.wthCat[1]}
        />
        <ResultCard
          value={resultados.wr}
          label="Riesgo cintura"
          categoryColor={resultados.wrColor}
        />
      </div>

      {resultados.fatToLose && resultados.fatToLose > 0 && (
        <div style={{
          marginTop: '12px', padding: '10px 14px',
          background: '#fff', borderRadius: '8px',
          border: '1px solid #D4AF37',
        }}>
          <p style={{ fontSize: '12px', color: '#374151', margin: 0 }}>
            <strong style={{ color: '#B45309' }}>Meta sugerida:</strong> perder{' '}
            <strong>{resultados.fatToLose} kg</strong> de grasa para llegar al rango optimo ({resultados.optRange}%).
            A razon de 600g/semana: <strong>{resultados.weeksToGoal} semanas aprox.</strong>
          </p>
        </div>
      )}

      {resultados.navy && resultados.deur && (
        <p style={{ fontSize: '10px', color: '#9CA3AF', margin: '8px 0 0' }}>
          Metodos: US Navy {resultados.navy}% · Deurenberg {resultados.deur}% · Promedio {resultados.bf}%
        </p>
      )}
    </div>
  );
}
