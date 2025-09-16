import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en-US': enUS
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
});

const InterviewCalendar = ({ interviews = [], onSelectSlot, onSelectEvent }) => {
    const [view, setView] = useState('week');

    // Convert interviews to calendar events
    const events = (interviews || []).map(interview => {
        // Safe access to nested properties with fallback
        const jobTitle = interview?.applicationId?.jobId?.title || 'Untitled Position';
        return {
            id: interview._id,
            title: `Interview: ${jobTitle}`,
            start: new Date(interview.scheduledTime),
            end: new Date(new Date(interview.scheduledTime).getTime() + (interview.duration || 60) * 60000),
            interview: interview // Store the full interview object for reference
        };
    });

    // Custom event styling
    const eventStyleGetter = (event) => {
        const style = {
            backgroundColor: '#3182ce',
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };

        // Different colors for different interview statuses
        const statusColors = {
            scheduled: '#3182ce',
            completed: '#48bb78',
            cancelled: '#e53e3e',
            rescheduled: '#ed8936'
        };

        style.backgroundColor = statusColors[event.interview.status] || style.backgroundColor;

        return {
            style
        };
    };

    return (
        <div className="h-[600px] bg-white rounded-lg shadow-lg p-4">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                view={view}
                onView={setView}
                selectable
                onSelectSlot={onSelectSlot}
                onSelectEvent={onSelectEvent}
                eventPropGetter={eventStyleGetter}
                defaultView="week"
                views={['month', 'week', 'day']}
                step={30}
                timeslots={2}
                min={new Date(0, 0, 0, 9, 0, 0)} // 9:00 AM
                max={new Date(0, 0, 0, 17, 0, 0)} // 5:00 PM
            />
        </div>
    );
};

export default InterviewCalendar;