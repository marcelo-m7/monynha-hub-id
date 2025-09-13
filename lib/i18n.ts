// Portuguese localization strings for Monynha Me
export const pt = {
  common: {
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Salvar",
    edit: "Editar",
    delete: "Excluir",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
    close: "Fechar",
    search: "Pesquisar",
    filter: "Filtrar",
    clear: "Limpar",
    apply: "Aplicar",
    reset: "Redefinir",
  },
  auth: {
    signIn: "Entrar",
    signUp: "Criar Conta",
    signOut: "Sair",
    email: "E-mail",
    password: "Senha",
    confirmPassword: "Confirmar Senha",
    fullName: "Nome Completo",
    forgotPassword: "Esqueceu a senha?",
    rememberMe: "Lembrar de mim",
    alreadyHaveAccount: "Já tem uma conta?",
    dontHaveAccount: "Não tem uma conta?",
    createAccount: "Criar conta",
    welcomeBack: "Bem-vindo de volta",
    createYourAccount: "Crie sua conta",
    signInToAccount: "Entre na sua conta",
    enterEmailBelow: "Digite seu e-mail abaixo para entrar na sua conta",
    enterDetailsBelow: "Digite seus dados abaixo para criar sua conta",
  },
  dashboard: {
    title: "Painel de Controle",
    welcome: "Bem-vindo",
    accountStatus: "Status da Conta",
    yourApps: "Seus Aplicativos",
    usageStats: "Estatísticas de Uso",
    availableApps: "aplicativos disponíveis",
    memberSince: "Membro desde",
    categories: "Categorias",
    noAppsAvailable: "Nenhum aplicativo disponível",
    noAppsMessage:
      "Nenhum aplicativo foi atribuído à sua conta ainda. Entre em contato com a equipe Monynha para mais informações sobre os aplicativos disponíveis.",
    accessApp: "Acessar",
    accountPending: "Conta Pendente de Aprovação",
    accountApproved: "Conta Aprovada",
    accountRejected: "Conta Rejeitada",
    pendingMessage:
      "Sua conta está sendo analisada pela equipe Monynha. Você receberá uma notificação quando for aprovada.",
    rejectedMessage: "Sua conta foi rejeitada.",
    reason: "Motivo",
  },
  admin: {
    title: "Painel Administrativo",
    subtitle: "Gerenciamento de usuários e aprovações",
    totalUsers: "Total de Usuários",
    pendingUsers: "Usuários Pendentes",
    approvedUsers: "Usuários Aprovados",
    rejectedUsers: "Usuários Rejeitados",
    recentRegistrations: "Registros Recentes",
    pendingRequests: "Solicitações Pendentes",
    pendingRequestsSubtitle: "Usuários aguardando aprovação para acessar o ecossistema Monynha",
    noPendingRequests: "Nenhuma solicitação pendente no momento",
    registeredOn: "Registrado em",
    approve: "Aprovar",
    reject: "Rejeitar",
    rejectRequest: "Rejeitar Solicitação",
    rejectConfirmation:
      "Tem certeza que deseja rejeitar esta solicitação? Você pode adicionar uma observação explicando o motivo.",
    notes: "Observações",
    optionalNotes: "Observações (opcional)",
    rejectionReason: "Motivo da rejeição...",
    confirmRejection: "Confirmar Rejeição",
    rejecting: "Rejeitando...",
    approving: "Aprovando...",
    userManagement: "Gerenciamento de Usuários",
    appManagement: "Gerenciamento de Aplicativos",
  },
  apps: {
    entertainment: "Entretenimento",
    productivity: "Produtividade",
    communication: "Comunicação",
    media: "Mídia",
    general: "Geral",
    education: "Educação",
    finance: "Finanças",
    health: "Saúde",
    travel: "Viagem",
    shopping: "Compras",
  },
  status: {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
    active: "Ativo",
    inactive: "Inativo",
  },
  messages: {
    accountUnderReview: "Sua conta está sendo analisada pela equipe Monynha",
    approvalNotification: "Você receberá uma notificação assim que o processo for concluído",
    whatHappensNext: "O que acontece agora?",
    reviewProcess: "Nossa equipe analisará sua solicitação",
    emailNotification: "Você receberá um e-mail com o resultado",
    accessGranted: "Se aprovado, terá acesso a todos os aplicativos",
    contactSupport: "Entre em contato com a equipe Monynha para mais informações",
    registrationNote: "Após o registro, sua conta será analisada pela equipe Monynha antes da aprovação.",
  },
  navigation: {
    home: "Início",
    dashboard: "Painel",
    profile: "Perfil",
    settings: "Configurações",
    admin: "Admin",
    help: "Ajuda",
    support: "Suporte",
  },
  errors: {
    unauthorized: "Não autorizado",
    forbidden: "Acesso negado",
    notFound: "Não encontrado",
    serverError: "Erro interno do servidor",
    networkError: "Erro de conexão",
    validationError: "Erro de validação",
    unknownError: "Erro desconhecido",
    tryAgain: "Tente novamente",
    contactSupport: "Entre em contato com o suporte se o problema persistir",
  },
  forms: {
    required: "Campo obrigatório",
    invalidEmail: "E-mail inválido",
    passwordTooShort: "Senha muito curta",
    passwordsDoNotMatch: "As senhas não coincidem",
    nameRequired: "Nome é obrigatório",
    emailRequired: "E-mail é obrigatório",
    passwordRequired: "Senha é obrigatória",
  },
  dates: {
    today: "Hoje",
    yesterday: "Ontem",
    thisWeek: "Esta semana",
    lastWeek: "Semana passada",
    thisMonth: "Este mês",
    lastMonth: "Mês passado",
    thisYear: "Este ano",
    lastYear: "Ano passado",
  },
}

export type TranslationKey = keyof typeof pt
export type NestedTranslationKey<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object ? `${string & K}.${NestedTranslationKey<T[K]>}` : string & K
    }[keyof T]
  : never

// Helper function to get nested translation
export function t(key: string): string {
  const keys = key.split(".")
  let value: any = pt

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k]
    } else {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
  }

  return typeof value === "string" ? value : key
}

// Date formatting utilities for Portuguese
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  })
}

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return "Agora mesmo"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutos atrás`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} horas atrás`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dias atrás`

  return formatDate(dateObj)
}
