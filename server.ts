import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI client (server-side only)
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Pedagogical Mentor Chat Endpoint
app.post('/api/gemini/mentor', async (req: Request, res: Response) => {
  try {
    const {
      message,
      practiceTitle,
      discipline,
      emotion,
      studentProfile,
      simplifiedMode,
      currentStep,
      variablesState,
      chatHistory,
    } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API no configurada en el servidor. Se utilizará el motor pedagógico offline integrado.',
      });
    }

    const systemInstruction = `
Eres "Ágora-Lab", un Asistente Virtual Pedagógico y Neuro-Adaptativo de Laboratorio de Ciencias (Física y Química) para estudiantes de planteles técnicos DGETI (CBTis, CETis, CBTa) de Educación Media Superior en México, bajo el Marco Curricular Común (MCCEMS) y el Diseño Universal para el Aprendizaje (DUA/UDL).

PERFIL DEL ALUMNO ACTUAL:
- Nombre / Identificador: ${studentProfile?.name || 'Estudiante DGETI'}
- Plantel: ${studentProfile?.school || 'CBTis/CETis'}
- Semestre: ${studentProfile?.semester || '4to Semestre'}
- Especialidad: ${studentProfile?.specialty || 'Técnico Laboratorista / Mecatrónica'}
- Estado Socioemocional actual: ${emotion || 'Confiado'}
- Modo Lenguaje Claro / Pictogramas (DUA): ${simplifiedMode ? 'ACTIVO (Usa oraciones cortas, listas con viñetas o emojis/iconos, lenguaje directo, sin sobrecarga cognitiva)' : 'ESTÁNDAR (Riguroso pero accesible, cálido)'}
- Práctica en curso: ${practiceTitle} (${discipline})
- Paso experimental actual: ${currentStep || 'General'}
- Estado de variables en mesa de simulación: ${JSON.stringify(variablesState || {})}

DIRECTRICES PEDAGÓGICAS VITALES:
1. ADAPTACIÓN SOCIOEMOCIONAL:
   - Si el alumno está "Ansioso", "Frustrado" o "Cansado": Desglosa las explicaciones en pasos extremadamente digeribles (máximo 2 a 3 líneas por idea). Felicita la iniciativa y el esfuerzo. Ofrece pistas reflexivas ("¿Qué pasaría si...?") en lugar de regaños o correcciones tajantes. Cero lenguaje punitivo.
   - Si el alumno está "Confiado" o "Motivado": Retalo con preguntas de indagación profunda, conexión con problemas de su entorno comunitario/industrial (ej. industria química mexicana, energías renovables, tratamiento de aguas, circuitos en talleres).
2. ADAPTACIÓN DUA:
   - Si el Modo Lenguaje Claro está activo, estructura la respuesta con encabezados claros y viñetas simples, usando iconos como 🧪 ⚖️ 💡 🔍 ⏱️.
3. ESTILO DE ASISTENCIA:
   - Sé un tutor socrático: no des las respuestas finales regaladas en una sola frase; guía al estudiante a formular hipótesis válidas, reconocer variables dependientes/independientes y analizar qué ocurre con los datos.
   - Responde siempre en español claro, cálido, motivador y con pertinencia técnica para bachillerato tecnológico mexicano.
`;

    const contents = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      for (const item of chatHistory.slice(-6)) {
        contents.push(`${item.sender === 'user' ? 'Alumno' : 'Ágora-Lab'}: ${item.text}`);
      }
    }
    contents.push(`Alumno: ${message}`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents.join('\n\n'),
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'He recibido tu mensaje. Continuemos con el experimento.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/gemini/mentor:', error);
    return res.status(500).json({
      error: 'Error procesando la consulta con la IA pedagógica',
      details: error?.message || String(error),
    });
  }
});

// MCCEMS Rubric Generation Endpoint
app.post('/api/gemini/rubric', async (req: Request, res: Response) => {
  try {
    const {
      practiceTitle,
      discipline,
      materialsMode,
      hypothesis,
      recordedData,
      conclusions,
      emotion,
      studentProfile,
    } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini no disponible; se utilizará la rúbrica heurística offline.',
      });
    }

    const prompt = `
Actúa como Evaluador Formativo Especialista en el Marco Curricular Común de la Educación Media Superior (MCCEMS) para la Dirección General de Educación Tecnológica Industrial y de Servicios (DGETI).

Analiza el desempeño experimental del estudiante:
- Estudiante: ${studentProfile?.name || 'Estudiante'} (Plantel: ${studentProfile?.school || 'CBTis/CETis'}, Especialidad: ${studentProfile?.specialty || 'General'})
- Práctica: ${practiceTitle} (${discipline})
- Modalidad de materiales: ${materialsMode === 'alternative' ? 'Materiales Alternativos / Comunitarios' : 'Materiales Estándar de Laboratorio'}
- Estado socioemocional reportado: ${emotion}
- Hipótesis planteada por el alumno: "${hypothesis}"
- Mediciones y datos registrados en la tabla: ${JSON.stringify(recordedData || [])}
- Conclusión / Reflexión del alumno: "${conclusions}"

Genera una RÚBRICA FORMATIVA MCCEMS en formato JSON estricto con las siguientes 4 categorías evaluadas en los 4 niveles de progresión del MCCEMS:
- "Receptivo" (Nivel 1: Requiere acompañamiento)
- "Resolutivo" (Nivel 2: Ejecuta procedimientos básicos)
- "Autónomo" (Nivel 3: Argumenta y analiza con autonomía)
- "Estratégico" (Nivel 4: Propone, transfiere e innova con pensamiento crítico)

Categorías requeridas:
1. Pensamiento Científico y Formulación de Hipótesis
2. Manejo de Variables y Lógica Procedimental
3. Capacidad de Análisis, Modelación y Conclusión
4. Responsabilidad Ambiental y Contextualización Comunitaria

Además incluye:
- "overallFeedback": Párrafo de retroalimentación cualitativa cálida, empática, formativa y motivadora adaptada a su estado emocional (${emotion}).
- "achievements": Lista de 3 logros evidentes en su trabajo.
- "growthAreas": Lista de 2 recomendaciones prácticas para seguir aprendiendo (sin lenguaje punitivo ni juicios negativos).
- "generalScore": Puntaje global de 0 a 100 ponderado formativamente.

Responde ÚNICAMENTE en JSON válido con la siguiente estructura:
{
  "generalScore": number,
  "levelReached": "Receptivo" | "Resolutivo" | "Autónomo" | "Estratégico",
  "criteria": [
    {
      "name": string,
      "level": "Receptivo" | "Resolutivo" | "Autónomo" | "Estratégico",
      "score": number, // sobre 25
      "observation": string
    }
  ],
  "overallFeedback": string,
  "achievements": string[],
  "growthAreas": string[]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/rubric:', error);
    return res.status(500).json({
      error: 'Error generando la rúbrica formativa con Gemini',
      details: error?.message || String(error),
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ágora-Lab] Servidor en ejecución en http://0.0.0.0:${PORT}`);
  });
}

startServer();
