import { useState } from 'react'
import { assets } from '../assets/assets'

const Testimonials = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0)

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Software Engineer at Microsoft",
            image: assets.profile_img,
            content: "I found my dream job through this platform! The application process was smooth and the job recommendations were spot on.",
            rating: 5
        },
        {
            name: "Raj Patel",
            role: "Data Scientist at Amazon",
            image: assets.profile_img,
            content: "Great platform with excellent job opportunities. The search filters helped me find exactly what I was looking for.",
            rating: 5
        },
        {
            name: "Emily Chen",
            role: "UX Designer at Adobe",
            image: assets.profile_img,
            content: "User-friendly interface and responsive support team. I landed multiple interviews within a week!",
            rating: 4
        }
    ]

    return (
        <div className='py-16 bg-white'>
            <div className='container 2xl:px-20 mx-auto px-4'>
                <div className='text-center mb-12'>
                    <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
                        What Our Users <span className='text-blue-600'>Say</span>
                    </h2>
                    <p className='text-gray-600 max-w-2xl mx-auto'>
                        Join thousands of professionals who found their perfect job through our platform
                    </p>
                </div>

                {/* Testimonials Carousel */}
                <div className='max-w-4xl mx-auto'>
                    <div className='bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 shadow-lg'>
                        <div className='text-center mb-6'>
                            <div className='flex justify-center mb-4'>
                                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                                    <img key={i} src={assets.star_filled_icon} alt="star" className='h-6 w-6 text-yellow-500 mx-1' />
                                ))}
                            </div>
                            <blockquote className='text-xl md:text-2xl text-gray-700 mb-8 italic'>
                                "{testimonials[currentTestimonial].content}"
                            </blockquote>
                        </div>

                        <div className='flex items-center justify-center'>
                            <img 
                                src={testimonials[currentTestimonial].image} 
                                alt={testimonials[currentTestimonial].name}
                                className='h-16 w-16 rounded-full mr-4 object-cover'
                            />
                            <div>
                                <div className='font-semibold text-gray-800 text-lg'>
                                    {testimonials[currentTestimonial].name}
                                </div>
                                <div className='text-gray-600'>
                                    {testimonials[currentTestimonial].role}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Dots */}
                    <div className='flex justify-center mt-8 space-x-3'>
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentTestimonial(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Testimonials