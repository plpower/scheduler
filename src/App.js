import React, { useState, useEffect } from 'react';
import 'rbx/index.css';
import { Button, Container, Title } from 'rbx';
import firebase from 'firebase/app';
import 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCmppenPvDvLR1nQ41ONn1yaeE_X2blSe0",
  authDomain: "scheduler-aa2af.firebaseapp.com",
  databaseURL: "https://scheduler-aa2af.firebaseio.com",
  projectId: "scheduler-aa2af",
  storageBucket: "scheduler-aa2af.appspot.com",
  messagingSenderId: "185928165166",
  appId: "1:185928165166:web:e7c65b689250f47325fcbf",
  measurementId: "G-W0WBNMHXBJ"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref();

// const schedule = {
//   "title": "CS Courses for 2018-2019",
//   "courses": [
//     {
//       "id": "F101",
//       "title": "Computer Science: Concepts, Philosophy, and Connections",
//       "meets": "MWF 11:00-11:50"
//     },
//     {
//       "id": "F110",
//       "title": "Intro Programming for non-majors",
//       "meets": "MWF 10:00-10:50"
//     },
//     {
//       "id": "F111",
//       "title": "Fundamentals of Computer Programming I",
//       "meets": "MWF 13:00-13:50"
//     },
//     {
//       "id": "F211",
//       "title": "Fundamentals of Computer Programming II",
//       "meets": "TuTh 12:30-13:50"
//     }
//   ]
// };

const App = () => {
  const [schedule, setSchedule] = useState({ title: '', courses: [] });

  useEffect(() => {
    const handleData = snap => {
      if (snap.val()) setSchedule(addScheduleTimes(snap.val()));
    }
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
  }, []);

  return (
    <Container>
      <Banner title={schedule.title} />
      <CourseList courses={schedule.courses} />
    </Container>
  );
};

const Banner = ({ title }) => (
  <Title>{title || '[loading...]'}</Title>
);

const CourseList = ({ courses }) => {
  const [term, setTerm] = useState('Fall');
  const [selected, toggle] = useSelection();
  const termCourses = courses.filter(course => term === getCourseTerm(course));

  return (
    <React.Fragment>
      <TermSelector state={{ term, setTerm }} />
      <Button.Group>
        {termCourses.map(course =>
          <Course key={course.id} course={course}
            state={{ selected, toggle }} />)}
      </Button.Group>
    </React.Fragment>
  );
};

const terms = { F: 'Fall', W: 'Winter', S: 'Spring' };

const TermSelector = ({ state }) => (
  <Button.Group hasAddons>
    {Object.values(terms)
      .map(value =>
        <Button key={value}
          color={buttonColor(value === state.term)}
          onClick={() => state.setTerm(value)}
        >
          {value}
        </Button>
      )
    }
  </Button.Group>
);

const buttonColor = selected => (
  selected ? 'success' : null
);

const getCourseTerm = course => (
  terms[course.id.charAt(0)]
);

const getCourseNumber = course => (
  course.id.slice(1, 4)
)

const Course = ({ course, state }) => (
  <Button color={buttonColor(state.selected.includes(course))}
    onClick={() => state.toggle(course)}
    onDoubleClick={() => moveCourse(course)}
    disabled={hasConflict(course, state.selected)}
  >
    {getCourseTerm(course)} CS { getCourseNumber(course)}: { course.title}
  </Button>
);

const moveCourse = course => {
  const meets = prompt('Enter new meeting data, in this format:', course.meets);
  if (!meets) return;
  const { days } = timeParts(meets);
  if (days) saveCourse(course, meets);
  else moveCourse(course);
};

const saveCourse = (course, meets) => {
  db.child('courses').child(course.id).update({ meets })
    .catch(error => alert(error));
};

const useSelection = () => {
  const [selected, setSelected] = useState([]);
  const toggle = (x) => {
    setSelected(selected.includes(x) ? selected.filter(y => y !== x) : [x].concat(selected))
  };
  return [selected, toggle];
};

const hasConflict = (course, selected) => (
  selected.some(selection => courseConflict(course, selection))
);

const days = ['M', 'Tu', 'W', 'Th', 'F'];

const meetsPat = /^ *((?:M|Tu|W|Th|F)+) +(\d\d?):(\d\d) *[ -] *(\d\d?):(\d\d) *$/;

const timeParts = meets => {
  const [match, days, hh1, mm1, hh2, mm2] = meetsPat.exec(meets) || [];
  return !match ? {} : {
    days,
    hours: {
      start: hh1 * 60 + mm1 * 1,
      end: hh2 * 60 + mm2 * 1
    }
  };
};

const addCourseTimes = course => ({
  ...course,
  ...timeParts(course.meets)
});

const addScheduleTimes = schedule => ({
  title: schedule.title,
  courses: Object.values(schedule.courses).map(addCourseTimes)
});

const daysOverlap = (days1, days2) => (
  days.some(day => days1.includes(day) && days2.includes(day))
);

const hoursOverlap = (hours1, hours2) => (
  Math.max(hours1.start, hours2.start) < Math.min(hours1.end, hours2.end)
);

const timeConflict = (course1, course2) => (
  daysOverlap(course1.days, course2.days) && hoursOverlap(course1.hours, course2.hours)
);

const courseConflict = (course1, course2) => (
  course1 !== course2
  && getCourseTerm(course1) === getCourseTerm(course2)
  && timeConflict(course1, course2)
);

export default App;