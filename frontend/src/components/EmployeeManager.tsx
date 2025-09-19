import { useState } from 'react';
import type { Employee } from '../types';
import { formatCurrency } from '../utils/format';
import { useConfirm } from './ConfirmDialog';

interface EmployeeManagerProps {
  employees: Employee[];
  onEmployeesChange: (employees: Employee[]) => void;
  disabled?: boolean;
}

interface EmployeeFormState {
  name: string;
  salary: string;
}

const initialEmployeeState: EmployeeFormState = {
  name: '',
  salary: '0'
};

export function EmployeeManager({ employees, onEmployeesChange, disabled = false }: EmployeeManagerProps) {
  const [form, setForm] = useState<EmployeeFormState>(initialEmployeeState);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { confirm, ConfirmDialogComponent } = useConfirm();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    if (!form.name.trim()) {
      alert('Por favor, indique o nome do empregado.');
      return;
    }

    const salary = parseFloat(form.salary.replace(',', '.'));
    if (!isFinite(salary) || salary < 0) {
      alert('Por favor, indique um salário válido.');
      return;
    }

    const newEmployee: Employee = {
      id: editingIndex !== null ? employees[editingIndex].id : String(Date.now()),
      name: form.name.trim(),
      salary: salary.toFixed(2)
    };

    let updatedEmployees: Employee[];
    if (editingIndex !== null) {
      // Editar empregado existente
      updatedEmployees = employees.map((emp, index) => 
        index === editingIndex ? newEmployee : emp
      );
      setEditingIndex(null);
    } else {
      // Adicionar novo empregado
      updatedEmployees = [...employees, newEmployee];
    }

    onEmployeesChange(updatedEmployees);
    setForm(initialEmployeeState);
  }

  function handleEdit(index: number) {
    const employee = employees[index];
    setForm({
      name: employee.name,
      salary: employee.salary
    });
    setEditingIndex(index);
  }

  function handleCancelEdit() {
    setForm(initialEmployeeState);
    setEditingIndex(null);
  }

  async function handleDelete(index: number) {
    const employee = employees[index];
    const confirmed = await confirm({
      title: 'Eliminar Empregado',
      message: `Tem a certeza que pretende eliminar o empregado "${employee.name}"?`,
      variant: 'danger'
    });

    if (confirmed) {
      const updatedEmployees = employees.filter((_, i) => i !== index);
      onEmployeesChange(updatedEmployees);
    }
  }

  return (
    <fieldset className="block">
      <legend>Empregados</legend>
      
      <div className="form-grid">
        <div>
          <label htmlFor="emp-name">Nome</label>
          <input
            id="emp-name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex.: Maria Silva"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
        </div>
        <div>
          <label htmlFor="emp-salary">Salário (€ / mês)</label>
          <input
            id="emp-salary"
            type="number"
            min="0"
            step="0.01"
            value={form.salary}
            onChange={(e) => setForm(prev => ({ ...prev, salary: e.target.value }))}
            placeholder="Ex.: 760.00"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
        </div>
        <div style={{ alignSelf: 'end' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {editingIndex !== null && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancelEdit}
                disabled={disabled}
              >
                Cancelar
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={disabled}
            >
              {editingIndex !== null ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>

      {employees.length === 0 ? (
        <p className="text-muted" style={{ margin: '12px 0 0' }}>
          Ainda não foram adicionados empregados.
        </p>
      ) : (
        <div style={{ marginTop: '12px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--primary)' }}>
            Lista de Empregados ({employees.length})
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {employees.map((employee, index) => (
              <div
                key={employee.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  border: editingIndex === index ? '2px solid var(--primary)' : '1px solid #e5e5e5'
                }}
              >
                <div>
                  <strong>{employee.name}</strong>
                  <br />
                  <span className="text-muted">
                    {formatCurrency(parseFloat(employee.salary))} / mês
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleEdit(index)}
                    disabled={disabled}
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(index)}
                    disabled={disabled}
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '8px' }}>
        <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
          <strong>Total salários:</strong> {formatCurrency(
            employees.reduce((sum, emp) => sum + parseFloat(emp.salary), 0)
          )} / mês
        </p>
        <p className="text-muted" style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>
          Os salários são considerados mensais para cálculos do dashboard.
        </p>
      </div>

      <ConfirmDialogComponent />
    </fieldset>
  );
}
