import {
  EmotionType,
  StudentProfile,
  MCCEMSRubricResult,
  MCCEMSCriterion,
  ExperimentDataPoint,
  PracticeDefinition,
} from '../types';

export const pedagogicalEngine = {
  getInitialGreeting(
    profile: StudentProfile,
    emotion: EmotionType,
    simplifiedMode: boolean
  ): string {
    const studentName = profile.name ? profile.name.split(' ')[0] : 'colega';
    const school = profile.school || 'tu plantel DGETI';

    if (simplifiedMode) {
      switch (emotion) {
        case 'ansioso':
          return `👋 Hola ${studentName}. No te preocupes. Vamos paso a paso. Yo te ayudo.`;
        case 'frustrado':
          return `👋 Hola ${studentName}. Tranquilo, equivocarse es parte de la ciencia. Vamos despacio.`;
        case 'cansado':
          return `👋 Hola ${studentName}. Haremos la práctica corta y clara. Tú marcas el ritmo.`;
        case 'motivado':
        case 'confiado':
        default:
          return `👋 ¡Hola ${studentName}! Todo listo en el simulador. Vamos a experimentar juntos.`;
      }
    }

    switch (emotion) {
      case 'ansioso':
        return `¡Hola, ${studentName}! Te doy una cálida bienvenida a Ágora-Lab. Sé que iniciar una práctica de laboratorio puede despertar nervios o temor a equivocarse, pero aquí estás en un espacio 100% seguro: ningún reactivo es tóxico, nada se romperá y cada error es una valiosa fuente de datos. Iremos paso a pasito con pistas claras. ¡Confío en tus capacidades! 🤝🧪`;
      case 'frustrado':
        return `Hola, ${studentName}. Respira hondo un momento. La ciencia real avanza precisamente gracias a los experimentos que no salieron a la primera: Thomas Edison o Marie Curie pasaron por cientos de intentos. Hoy en ${school} trabajaremos a tu ritmo, sin presiones ni calificaciones punitivas. Cuéntame con qué paso deseas empezar. 💡✨`;
      case 'cansado':
        return `¡Mucho ánimo, ${studentName}! Reconozco enormemente tu esfuerzo por estar aquí hoy practicando. Para no sobrecargarte, simplificaremos cada etapa: instrucciones directas, mediciones concisas y acompañamiento permanente. ¡Hagamos que esta sesión sea amena y productiva! 🔋🌱`;
      case 'motivado':
      case 'confiado':
      default:
        return `¡Excelente actitud científica, ${studentName}! Me alegra ver tu entusiasmo y seguridad para abordar esta práctica en ${school}. Hoy pondremos a prueba tu pensamiento crítico: formularemos hipótesis sólidas, analizaremos variables clave y conectaremos los resultados con problemas reales de tu entorno técnico. ¿Listo para iniciar la indagación? 🚀🔬`;
    }
  },

  getEmotionBadgeInfo(emotion: EmotionType) {
    switch (emotion) {
      case 'confiado':
        return { label: 'Confiado', icon: '😎', color: 'emerald', message: 'Modo Reto Científico activo' };
      case 'motivado':
        return { label: 'Motivado', icon: '🚀', color: 'cyan', message: 'Indagación profunda activada' };
      case 'ansioso':
        return { label: 'Ansioso', icon: '😟', color: 'amber', message: 'Acompañamiento empático y pasos guiados' };
      case 'cansado':
        return { label: 'Cansado', icon: '🥱', color: 'indigo', message: 'Ritmo ligero y sin sobrecarga cognitiva' };
      case 'frustrado':
        return { label: 'Frustrado', icon: '😣', color: 'rose', message: 'Validación emocional y pistas constructivas' };
    }
  },

  async queryVirtualMentor(params: {
    message: string;
    practice: PracticeDefinition;
    emotion: EmotionType;
    studentProfile: StudentProfile;
    simplifiedMode: boolean;
    currentStepTitle: string;
    variablesState: Record<string, any>;
    chatHistory: { sender: 'user' | 'mentor'; text: string }[];
  }): Promise<string> {
    // 1. Try server-side Gemini API proxy first
    try {
      const response = await fetch('/api/gemini/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: params.message,
          practiceTitle: params.practice.title,
          discipline: params.practice.discipline,
          emotion: params.emotion,
          studentProfile: params.studentProfile,
          simplifiedMode: params.simplifiedMode,
          currentStep: params.currentStepTitle,
          variablesState: params.variablesState,
          chatHistory: params.chatHistory,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          return data.reply;
        }
      }
    } catch {
      // Offline fallback: continue to offline intelligent engine
    }

    // 2. Offline Neuro-Adaptive Heuristic Pedagogical Engine
    return this.generateOfflineMentorResponse(params);
  },

  generateOfflineMentorResponse(params: {
    message: string;
    practice: PracticeDefinition;
    emotion: EmotionType;
    studentProfile: StudentProfile;
    simplifiedMode: boolean;
    currentStepTitle: string;
    variablesState: Record<string, any>;
  }): string {
    const textLower = params.message.toLowerCase();
    const isSimplified = params.simplifiedMode;
    const isGentleMode = params.emotion === 'ansioso' || params.emotion === 'frustrado' || params.emotion === 'cansado';

    if (isSimplified) {
      if (textLower.includes('qué hago') || textLower.includes('ayuda') || textLower.includes('paso')) {
        return `👉 Paso actual: ${params.currentStepTitle}.\n1. Ajusta los controles de la mesa.\n2. Pulsa "Registrar Medición".\n3. Si tienes dudas, pregúntame.`;
      }
      if (textLower.includes('ph') || textLower.includes('color')) {
        return `🧪 El color te indica la acidez:\n🔴 Rojo/Rosa = Ácido\n🟣 Morado = Neutro (pH 7)\n🟢 Verde/Amarillo = Básico.`;
      }
      if (textLower.includes('volt') || textLower.includes('corriente') || textLower.includes('ohm')) {
        return `⚡ Recuerda: Si subes el Voltaje, la Corriente sube. La Resistencia se opone al paso de electrones.`;
      }
      if (textLower.includes('presión') || textLower.includes('boyle') || textLower.includes('volumen')) {
        return `🛢️ Ley de Boyle: Si empujas el émbolo (más presión), el volumen del aire se hace más pequeño.`;
      }
      return `✅ Buen intento. Continúa registrando datos en tu tabla para ver la gráfica.`;
    }

    // Standard mode with emotional adaptation
    let prefix = '';
    if (isGentleMode) {
      prefix = 'Vas muy bien. No te apresures; ';
    } else {
      prefix = '¡Gran pregunta analítica! ';
    }

    if (textLower.includes('hipótesis') || textLower.includes('hipotesis')) {
      return `${prefix}Para redactar una excelente hipótesis en el MCCEMS, utiliza la estructura de causa y efecto: "Si modificamos [Variable Independiente], entonces ocurrirá [Efecto en la Variable Dependiente], porque [Fundamento científico]". Recuerda que una hipótesis nunca es "correcta" o "incorrecta", sino que se valida o refuta con los datos experimentales.`;
    }

    if (textLower.includes('col morada') || textLower.includes('indicador') || textLower.includes('fenolftaleína')) {
      return `${prefix}El extracto de col morada contiene antocianinas, que son pigmentos orgánicos sensibles a los iones hidronio (H⁺). En medio muy ácido (pH 1-3) se tiñe de rojo brillante; en pH neutro (7) es violeta; y en medio básico (pH 9-12) vira al verde azulado y amarillo. ¡Es una alternativa comunitaria idéntica a los indicadores de laboratorio!`;
    }

    if (textLower.includes('ohm') || textLower.includes('resistencia') || textLower.includes('voltaje')) {
      return `${prefix}La Ley de Ohm (V = I × R) nos dice que la corriente (I) es directamente proporcional al voltaje aplicado e inversamente proporcional a la resistencia del circuito. Si graficas Voltaje contra Corriente, la pendiente de esa recta representa exactamente el valor de tu resistencia en Ohms.`;
    }

    if (textLower.includes('boyle') || textLower.includes('presión') || textLower.includes('volumen') || textLower.includes('jeringa')) {
      return `${prefix}La Ley de Boyle establece un proceso isotérmico (temperatura constante). Al reducir el volumen del gas a la mitad, las moléculas tienen menos espacio para moverse y colisionan el doble de veces contra las paredes del recipiente, duplicando la presión ejercida (P₁ × V₁ = P₂ × V₂).`;
    }

    if (textLower.includes('lavoisier') || textLower.includes('conservación') || textLower.includes('masa') || textLower.includes('globo')) {
      return `${prefix}Antoine Lavoisier demostró en 1789 que "La materia no se crea ni se destruye, solo se transforma". Si la botella está abierta, el gas CO₂ escapa y la balanza parece perder peso; pero si colocas el globo o tapas el matraz (sistema cerrado), la masa inicial es exactamente igual a la final.`;
    }

    if (textLower.includes('error') || textLower.includes('equivoqué') || textLower.includes('fallé')) {
      return `¡En la ciencia no hay fracasos! Los datos atípicos o inesperados son los que han dado pie a los mayores descubrimientos en la historia. Cuéntame qué valor te salió y analicemos juntos por qué se comporta de esa forma.`;
    }

    return `${prefix}Observa cómo interactúan las variables en tu mesa de simulación. Recuerda registrar al menos 4 o 5 puntos distintos en la bitácora para que la gráfica represente claramente el modelo científico de la práctica.`;
  },

  async evaluateRubricMCCEMS(params: {
    practice: PracticeDefinition;
    materialsMode: 'standard' | 'alternative';
    hypothesis: string;
    recordedData: ExperimentDataPoint[];
    conclusions: string;
    emotion: EmotionType;
    studentProfile: StudentProfile;
  }): Promise<MCCEMSRubricResult> {
    // 1. Try server-side Gemini API proxy
    try {
      const response = await fetch('/api/gemini/rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceTitle: params.practice.title,
          discipline: params.practice.discipline,
          materialsMode: params.materialsMode,
          hypothesis: params.hypothesis,
          recordedData: params.recordedData,
          conclusions: params.conclusions,
          emotion: params.emotion,
          studentProfile: params.studentProfile,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.criteria && data.generalScore !== undefined) {
          return {
            ...data,
            evaluationDate: new Date().toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            isAiGenerated: true,
          };
        }
      }
    } catch {
      // Fallback to offline heuristic rubric evaluator
    }

    // 2. Offline MCCEMS Rubric Engine
    return this.generateOfflineMCCEMSRubric(params);
  },

  generateOfflineMCCEMSRubric(params: {
    practice: PracticeDefinition;
    materialsMode: 'standard' | 'alternative';
    hypothesis: string;
    recordedData: ExperimentDataPoint[];
    conclusions: string;
    emotion: EmotionType;
    studentProfile: StudentProfile;
  }): MCCEMSRubricResult {
    const dataCount = params.recordedData.length;
    const hypLen = params.hypothesis.trim().length;
    const concLen = params.conclusions.trim().length;

    // Criterion 1: Pensamiento Científico y Formulación de Hipótesis
    let c1Score = 18;
    let c1Level: any = 'Resolutivo';
    let c1Obs = 'Plantea una hipótesis inicial relacionada con las variables del fenómeno.';
    if (hypLen > 70 && (params.hypothesis.toLowerCase().includes('si') || params.hypothesis.toLowerCase().includes('entonces'))) {
      c1Score = 24;
      c1Level = 'Estratégico';
      c1Obs = 'Formula una hipótesis formal estructurada (causa-efecto), predictiva y refutable.';
    } else if (hypLen > 30) {
      c1Score = 21;
      c1Level = 'Autónomo';
      c1Obs = 'Formula una conjetura clara identificando las variables dependiente e independiente.';
    } else if (hypLen === 0) {
      c1Score = 15;
      c1Level = 'Receptivo';
      c1Obs = 'Requiere orientación para redactar la predicción inicial de la práctica.';
    }

    // Criterion 2: Manejo de Variables y Lógica Procedimental
    let c2Score = 18;
    let c2Level: any = 'Resolutivo';
    let c2Obs = 'Registra mediciones básicas en la bitácora experimental.';
    if (dataCount >= 5) {
      c2Score = 25;
      c2Level = 'Estratégico';
      c2Obs = 'Excelente rigor experimental: registra 5 o más puntos con control sistemático de variables.';
    } else if (dataCount >= 3) {
      c2Score = 22;
      c2Level = 'Autónomo';
      c2Obs = 'Toma suficientes mediciones para observar la tendencia de la variable dependiente.';
    } else if (dataCount >= 1) {
      c2Score = 17;
      c2Level = 'Resolutivo';
      c2Obs = 'Realiza mediciones preliminares; se recomienda ampliar el rango de muestreo.';
    } else {
      c2Score = 14;
      c2Level = 'Receptivo';
      c2Obs = 'Debe interactuar más con los controles de la mesa de simulación.';
    }

    // Criterion 3: Capacidad de Análisis, Modelación y Conclusión
    let c3Score = 18;
    let c3Level: any = 'Resolutivo';
    let c3Obs = 'Comenta los resultados generales obtenidos en el laboratorio.';
    if (concLen > 80 && (params.conclusions.toLowerCase().includes('porque') || params.conclusions.toLowerCase().includes('debido'))) {
      c3Score = 24;
      c3Level = 'Estratégico';
      c3Obs = 'Argumenta sólidamente la validez de la hipótesis apoyándose en la gráfica y datos.';
    } else if (concLen > 35) {
      c3Score = 21;
      c3Level = 'Autónomo';
      c3Obs = 'Sintetiza de forma clara el comportamiento observado y responde a las preguntas guía.';
    } else if (concLen > 0) {
      c3Score = 17;
      c3Level = 'Resolutivo';
      c3Obs = 'Conclusión elemental; se sugiere profundizar en el fundamento científico.';
    } else {
      c3Score = 14;
      c3Level = 'Receptivo';
      c3Obs = 'Pendiente de redactar la reflexión de cierre con el Asistente Ágora-Lab.';
    }

    // Criterion 4: Responsabilidad Ambiental y Contextualización Comunitaria
    let c4Score = 22;
    let c4Level: any = 'Autónomo';
    let c4Obs = `Demuestra pertinencia en el uso de insumos (${params.materialsMode === 'alternative' ? 'materiales comunitarios accesibles' : 'reactivos de laboratorio'}) y minimización de residuos.`;
    if (params.materialsMode === 'alternative') {
      c4Score = 25;
      c4Level = 'Estratégico';
      c4Obs = 'Excelente transferencia tecnológica usando insumos biodegradables y comunitarios de bajo impacto.';
    }

    const totalScore = c1Score + c2Score + c3Score + c4Score;
    let overallLevel: any = 'Resolutivo';
    if (totalScore >= 90) overallLevel = 'Estratégico';
    else if (totalScore >= 75) overallLevel = 'Autónomo';
    else if (totalScore >= 60) overallLevel = 'Resolutivo';
    else overallLevel = 'Receptivo';

    const criteria: MCCEMSCriterion[] = [
      {
        name: 'Pensamiento Científico y Formulación de Hipótesis',
        level: c1Level,
        score: c1Score,
        observation: c1Obs,
        recommendation: 'Continúa contrastando tus predicciones teóricas con la evidencia empírica recolectada.',
      },
      {
        name: 'Manejo de Variables y Lógica Procedimental',
        level: c2Level,
        score: c2Score,
        observation: c2Obs,
        recommendation: 'Asegura siempre registrar intervalos regulares para obtener curvas con mayor resolución.',
      },
      {
        name: 'Capacidad de Análisis, Modelación y Conclusión',
        level: c3Level,
        score: c3Score,
        observation: c3Obs,
        recommendation: 'Vincula los gráficos resultantes con los principios y fórmulas estudiadas en clase.',
      },
      {
        name: 'Responsabilidad Ambiental y Contextualización Comunitaria',
        level: c4Level,
        score: c4Score,
        observation: c4Obs,
        recommendation: 'Fomenta la química verde y la sustitución de reactivos peligrosos en tu entorno escolar.',
      },
    ];

    const studentName = params.studentProfile.name || 'Estudiante';
    const emotionNote =
      params.emotion === 'ansioso' || params.emotion === 'frustrado'
        ? 'Destacamos enormemente tu perseverancia y valor para enfrentar la práctica. Has demostrado que la perseverancia rinde grandes frutos científicos.'
        : 'Tu curiosidad científica y entusiasmo han quedado reflejados en la calidad de tus observaciones experimentales.';

    return {
      generalScore: totalScore,
      levelReached: overallLevel,
      evaluationDate: new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      criteria,
      overallFeedback: `¡Felicidades, ${studentName}! Has completado con éxito la práctica "${params.practice.title}". ${emotionNote} Tu desempeño demuestra un dominio formativo integral de las progresiones del MCCEMS para el bachillerato tecnológico.`,
      achievements: [
        'Formulación y seguimiento metodológico de la práctica experimental situada.',
        'Manejo ordenado de la bitácora científica con registro de variables.',
        `Aprovechamiento idóneo de los ${params.materialsMode === 'alternative' ? 'recursos locales y comunitarios' : 'instrumentos de laboratorio'} respetando la seguridad.`,
      ],
      growthAreas: [
        'Profundizar en la interpretación de los puntos de inflexión en los modelos gráficos.',
        'Proponer nuevas variantes experimentales aplicadas a problemas productivos de tu región.',
      ],
      isAiGenerated: false,
    };
  },
};
