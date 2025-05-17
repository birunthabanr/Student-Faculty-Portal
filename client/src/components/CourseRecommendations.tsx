import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const recommendedCourses = [
  {
    id: 1,
    title: "Machine Learning Fundamentals",
    description: "Learn the basics of machine learning algorithms and applications",
    level: "Intermediate",
    duration: "8 weeks"
  },
  {
    id: 2,
    title: "Web Development Bootcamp",
    description: "Master modern web development with React and Node.js",
    level: "Beginner",
    duration: "12 weeks"
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    description: "Essential computer science concepts for technical interviews",
    level: "Advanced",
    duration: "10 weeks"
  }
];

export const CourseRecommendations = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recommendedCourses.map((course) => (
        <Card key={course.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{course.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">{course.description}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Level: {course.level}</span>
              <span>Duration: {course.duration}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 