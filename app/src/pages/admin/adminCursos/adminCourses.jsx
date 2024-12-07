import CoursesTable from './tablaCursos/tablaCursos';
import CreateCourse from './createCourse/createCourse';

const adminCourses = () => {
    return (
        <div>
            <CreateCourse />
            <CoursesTable />
        </div>
    );
    }

export default adminCourses;