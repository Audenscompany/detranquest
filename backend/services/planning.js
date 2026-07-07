import memoryService from './memory.js';
import { v4 as uuid } from 'uuid';

class PlanningAgent {
  constructor() {
    this.activeGoals = [];
  }

  async createPlan(objective, context = {}) {
    const planId = uuid();
    const tasks = this.breakdownObjective(objective);

    const plan = {
      id: planId,
      objective,
      tasks,
      status: 'active',
      createdAt: new Date(),
      progress: 0,
      estimatedCompletion: this.estimateCompletion(tasks)
    };

    memoryService.saveMemory(`plan_${planId}`, plan, 'planning');
    this.activeGoals.push(plan);

    return plan;
  }

  breakdownObjective(objective) {
    const lower = objective.toLowerCase();
    const tasks = [];

    // Identificar tipo de objetivo
    const type = this.identifyObjectiveType(objective);

    // Gerar tarefas baseado no tipo
    switch (type) {
      case 'learning':
        tasks.push(
          { title: 'Coletar materiais relevantes', priority: 'high', status: 'pending' },
          { title: 'Organizar conteúdo por tópicos', priority: 'high', status: 'pending' },
          { title: 'Estudar fundamentos', priority: 'medium', status: 'pending' },
          { title: 'Praticar conceitos', priority: 'medium', status: 'pending' },
          { title: 'Consolidar conhecimento', priority: 'low', status: 'pending' }
        );
        break;

      case 'analysis':
        tasks.push(
          { title: 'Reunir dados relevantes', priority: 'high', status: 'pending' },
          { title: 'Identificar padrões', priority: 'high', status: 'pending' },
          { title: 'Comparar perspectivas', priority: 'medium', status: 'pending' },
          { title: 'Sintetizar conclusões', priority: 'medium', status: 'pending' }
        );
        break;

      case 'problem_solving':
        tasks.push(
          { title: 'Definir o problema com precisão', priority: 'high', status: 'pending' },
          { title: 'Listar possíveis causas', priority: 'high', status: 'pending' },
          { title: 'Brainstorm de soluções', priority: 'medium', status: 'pending' },
          { title: 'Avaliar viabilidade de cada solução', priority: 'medium', status: 'pending' },
          { title: 'Implementar melhor solução', priority: 'high', status: 'pending' }
        );
        break;

      default:
        tasks.push(
          { title: 'Entender o que é necessário', priority: 'high', status: 'pending' },
          { title: 'Coletar informações', priority: 'high', status: 'pending' },
          { title: 'Executar ações', priority: 'medium', status: 'pending' },
          { title: 'Validar resultado', priority: 'medium', status: 'pending' }
        );
    }

    return tasks.map((task, idx) => ({
      ...task,
      id: uuid(),
      order: idx + 1
    }));
  }

  identifyObjectiveType(objective) {
    const lower = objective.toLowerCase();

    if (/aprenda|aprendo|estou aprendendo|ensine/i.test(lower)) {
      return 'learning';
    }

    if (/analise|compare|diferença|vantagem|desvantagem/i.test(lower)) {
      return 'analysis';
    }

    if (/problema|solução|como resolver|issue|bug/i.test(lower)) {
      return 'problem_solving';
    }

    return 'general';
  }

  estimateCompletion(tasks) {
    const highPriorityCount = tasks.filter(t => t.priority === 'high').length;
    const mediumPriorityCount = tasks.filter(t => t.priority === 'medium').length;

    // Estimativa simples: 1 dia por tarefa high, 0.5 dia por medium
    const estimatedDays = highPriorityCount + (mediumPriorityCount * 0.5);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + Math.ceil(estimatedDays));

    return completionDate;
  }

  updateTaskStatus(planId, taskId, status) {
    const plan = memoryService.getMemory(`plan_${planId}`);
    if (!plan) return null;

    const task = plan.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      plan.progress = this.calculateProgress(plan.tasks);
      memoryService.saveMemory(`plan_${planId}`, plan, 'planning');
    }

    return plan;
  }

  calculateProgress(tasks) {
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  }

  getActivePlan(planId) {
    return memoryService.getMemory(`plan_${planId}`);
  }

  getNextTask(planId) {
    const plan = this.getActivePlan(planId);
    if (!plan) return null;

    return plan.tasks.find(t => t.status === 'pending');
  }

  completeTask(planId, taskId) {
    return this.updateTaskStatus(planId, taskId, 'completed');
  }
}

export default new PlanningAgent();
