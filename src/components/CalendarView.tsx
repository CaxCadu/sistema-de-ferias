import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { useRequests } from '../contexts/RequestsContext';
import { CalendarEvent } from '../types';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarView() {
  const { requests } = useRequests();
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
  };

  const getEventsForDay = (day: number): CalendarEvent[] => {
    const dayDate = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    
    return requests
      .filter(request => request.status === 'approved' || request.status === 'hr_notified')
      .filter(request => {
        const startDate = request.startDate;
        const endDate = request.endDate;
        return dayDate >= startDate && dayDate <= endDate;
      })
      .map(request => ({
        id: request.id,
        title: `${request.employeeName} - ${request.type === 'vacation' ? 'Férias' : 'Ausência'}`,
        start: request.startDate,
        end: request.endDate,
        type: request.type,
        status: request.status,
        employeeName: request.employeeName
      }));
  };

  const approvedRequests = requests.filter(r => r.status === 'approved' || r.status === 'hr_notified');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Calendário de Ausências</h2>
              <p className="mt-1 text-sm text-gray-600">
                Visualize férias e ausências aprovadas
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Férias</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Ausências</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-24 p-1"></div>;
              }

              const events = getEventsForDay(day);
              const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

              return (
                <div
                  key={day}
                  className={`h-24 p-1 border border-gray-200 ${isToday ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'} transition-colors duration-200`}
                >
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'} mb-1`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-2 py-1 rounded text-white truncate ${
                          event.type === 'vacation' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}
                        title={event.title}
                      >
                        {event.employeeName}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{events.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {approvedRequests.filter(r => r.type === 'vacation').length}
                  </p>
                  <p className="text-sm text-blue-600">Férias Aprovadas</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">
                    {approvedRequests.filter(r => r.type === 'absence').length}
                  </p>
                  <p className="text-sm text-purple-600">Ausências Aprovadas</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-900">
                    {approvedRequests.length}
                  </p>
                  <p className="text-sm text-green-600">Total de Solicitações</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}