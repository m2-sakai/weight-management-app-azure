'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import { useCallback, useEffect, useState } from 'react';
import { InputModal } from '@/app/ui/calender/InputModal';
import { fetchWeights } from '@/app/lib/data';
import { auth } from '@/auth';
import { getSession } from '@/app/lib/actions';
import { UserSession } from '@/app/types/UserSession';

type AddEventState = {
  date: string;
  calenderApi: any;
};

type Event = {
  title: string;
  date: string;
  allDay: boolean;
  display: string;
};

export default function Page() {
  const [email, setEmail] = useState<string>('');
  const [initialEvent, setInitialEvent] = useState<Event[]>([]);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [addEvent, setAddEvent] = useState<AddEventState>({ date: '', calenderApi: undefined });

  useEffect(() => {
    const data = async () => {
      const session: UserSession = await getSession();
      setEmail(session.email);

      const currentDate: Date = new Date();
      const currentMonth: number = currentDate.getMonth() + 1;
      const weightList = await fetchWeights(session.email, currentMonth);
      const initialEventList: Event[] = [];
      weightList.forEach((weight) => {
        const event: Event = {
          title: weight.weight.toString() + ' kg',
          date: weight.date,
          allDay: true,
          display: 'list-item',
        };
        initialEventList.push(event);
      });
      setInitialEvent(initialEventList);
    };
    data();
  }, []);

  const handleDateClick = useCallback((clickInfo: DateClickArg) => {
    setAddEvent({
      date: clickInfo.dateStr,
      calenderApi: clickInfo.view.calendar,
    });
    setIsOpenModal(true);
  }, []);

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        locale={jaLocale} // 日本語化
        businessHours={true} // 土日をグレーに塗る
        editable={true}
        initialDate={new Date()}
        contentHeight={'auto'}
        selectable={true}
        dateClick={(info) => {
          handleDateClick(info);
        }}
        events={initialEvent}
      />
      <p className="text-[30px]">現在の体重：</p>
      {isOpenModal && (
        <InputModal
          email={email}
          date={addEvent.date}
          calenderApi={addEvent.calenderApi}
          setIsOpenModal={setIsOpenModal}
        />
      )}
    </div>
  );
}
