import { 
  GraduationCap, 
  BriefcaseBusiness, 
  Plane, 
  Car, 
  Globe2, 
  Map,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  ArrowRight
} from 'lucide-react';

const services = [
  {
    title: "Study Abroad Guidance",
    description: "We connect Zambian students with trusted universities around the world-including options in India, Europe, China, and Australia. Some partner institutions offer scholarships and education loans.",
    icon: <GraduationCap className="w-8 h-8 text-blue-600" />
  },
  {
    title: "Paid Internships",
    description: "Gain global experience through paid internship programs in reputable companies abroad.",
    icon: <BriefcaseBusiness className="w-8 h-8 text-blue-600" />
  },
  {
    title: "Flight Booking Assistance",
    description: "Affordable and student-friendly flight bookings to help you travel with ease and confidence.",
    icon: <Plane className="w-8 h-8 text-blue-600" />
  },
  {
    title: "Car Hire Services",
    description: "Convenient transportation options available for students, tourists, and travelers.",
    icon: <Car className="w-8 h-8 text-blue-600" />
  },
  {
    title: "Work Abroad Support",
    description: "We guide you through finding job opportunities and navigating visa processes for working in other countries.",
    icon: <Globe2 className="w-8 h-8 text-blue-600" />
  },
  {
    title: "Tour Packages",
    description: "Explore exciting international destinations with personalized travel and tour packages.",
    icon: <Map className="w-8 h-8 text-blue-600" />
  }
];

const teamMembers = [
  {
    name: "Danny Chisabanga",
    role: "CEO / Founder",
    image: "/danny.jpeg",
    bio: "Danny Chisabanga is the founder and CEO of Danny's Connect, established in 2018 with the vision of connecting prospective students to opportunities for higher education. His mission is rooted in the conviction that no one should be denied access to tertiary education due to financial constraints, and that education should be accessible to all, regardless of economic background. With a strong academic background, Danny holds a Bachelor's degree in Banking and Finance, an MBA in Finance Management, and additional qualifications in Aircraft Cargo Aviation, Paralegal Studies, Teaching, Monitoring and Evaluation. He is also pursuing a Doctorate in Management Studies. In addition to leading Danny's Connect, Danny serves as the National Secretary of IAESTE Zambia an organization that links students to paid internships abroad. Since founding Danny's Connect, he has organized numerous education expos across the country and advised universities on attracting talent from across Africa and beyond. Under his leadership, Danny's Connect has grown to become a trusted platform for students across Sub-Saharan Africa and beyond, empowering many to pursue their educational dreams."
  },
  {
    name: "Natasha Mwandila",
    role: "Accountant",
    image: "/sec.jpeg",
    bio: "Member of Danny's Connect since 2021. Currently serving as an Accountant Natasha holds a Bachelor's degree in Business Administration and a B.Sc. Hons in Biotechnology. She brings a diverse educational background and dedicated expertise to her role, contributing to the growth and success of Danny's Connect."
  },
  {
    name: "Bates Moonga",
    role: "Marketing Manager",
    image: "/bates.jpeg",
    bio: "Bates Moonga joined Danny's Connect in 2020 and currently serves as the Marketing Manager. He holds a Bachelor's Degree in Business Administration, bringing valuable expertise and strategic insight to the team. Bates is dedicated to driving brand growth and fostering meaningful connections within the community."
  },
  {
    name: "Rachael Muholwa",
    role: "Student Internship Exchange Director",
    image: "/zics.jpeg",
    bio: "Rachael Muholwa joined Danny's Connect in 2022 and currently serves as the Student Internship Exchange Director. She holds a Bachelor's Degree in Accountancy and is pursuing the ACCA qualification alongside a Bachelor of Laws (LLB). Rachael brings a multidisciplinary perspective that combines finance, governance, and justice. At Danny's Connect, she is dedicated to connecting students, interns, and travelers to transformative academic and professional opportunities both locally and internationally."
  },
  {
    name: "Joyce Mwachilenga",
    role: "International Student Admission Officer",
    image: "/lastt.jpeg",
    bio: "Joyce Mwachilenga joined Danny's Connect in 2023 and currently serves as an International Student Admission Officer. She holds a Bachelor's Degree in Pharmacy. As part of the team, Joyce contributes by coaching students for IELTS, TOEFL, and SAT exams, helping them unlock transformative academic and professional opportunities both locally and internationally."
  }
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Danny's Connect Logo" 
                className="w-60 h-15 object-contain"
              />
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</a>
              <a href="/about-us" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">About Us</a>
              <a href="/gallery" className="text-gray-600 hover:text-blue-600 font-medium">Gallery</a>
              <a href="/contact-us" className="text-gray-600 hover:text-blue-600 font-medium">Contact Us</a>
              <div className="flex items-center space-x-4 ml-4">
                <a href="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</a>
                <a href="/signup" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition">Sign Up</a>
              </div>
            </div>
            {/* Mobile menu button could go here */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-16 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
              <span className="block text-gray-900">Empowering Dreams</span>
              <span className="block text-blue-600">Through Global Education</span>
            </h1>
            <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 leading-relaxed">
              Danny's Connect was founded in 2018 by Danny Chisabanga with a mission to make quality post-secondary education accessible to all regardless of financial background. We believe that education is a powerful tool for transformation, not just for individuals, but for entire communities and nations.
            </p>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="/grads.jpg"
            alt="Students graduating"
          />
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What We Offer</h2>
            <div className="mt-2 w-24 h-1 bg-blue-600 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Now It's Your Turn</h2>
          <h3 className="text-2xl font-light mb-6">Hundreds of African Students Take Their First Step Abroad With Us!</h3>
          <p className="max-w-2xl mx-auto text-blue-100 mb-8 text-lg">
            At Danny's Connect, we help students and young professionals access life-changing opportunities from global education to internships, travel, and work abroad. Get expert guidance, trusted university links, and support every step of the way.
          </p>
          <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 flex items-center mx-auto space-x-2">
            <span>Try Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Professional Team</h2>
            <p className="mt-4 text-xl text-gray-600">Meet our team at your convenience.</p>
            <div className="mt-4 w-24 h-1 bg-blue-600 mx-auto rounded"></div>
          </div>

          <div className="space-y-12">
            {/* CEO Row - Full width for longer text */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row">
              <div className="lg:w-1/3">
                <img className="w-full h-full object-cover min-h-[300px]" src={teamMembers[0].image} alt={teamMembers[0].name} />
              </div>
              <div className="p-8 lg:w-2/3 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900">{teamMembers[0].name}</h3>
                <p className="text-blue-600 font-medium mb-4 uppercase tracking-wider text-sm">{teamMembers[0].role}</p>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{teamMembers[0].bio}</p>
              </div>
            </div>

            {/* Rest of the team grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMembers.slice(1).map((member, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row">
                  <div className="sm:w-2/5">
                    <img className="w-full h-full object-cover min-h-[250px] sm:min-h-full" src={member.image} alt={member.name} />
                  </div>
                  <div className="p-6 sm:w-3/5">
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-3 text-sm">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            <div>
              <h4 className="text-xl font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/about-us" className="hover:text-white transition">About Us</a></li>
                <li><a href="/contact-us" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="/for-students" className="hover:text-white transition">For Students</a></li>
                <li><a href="/for-universities" className="hover:text-white transition">For Universities</a></li>
                <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Help</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition">Terms & Conditions</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Socials</h4>
              <p className="text-gray-400 mb-4">Follow us and get in touch with us on the following Social Media Platform</p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Subscribe</h4>
              <p className="text-gray-400 mb-4 text-sm">Join our team by subscribing to our newsletter so you get updates every time we have new opportunities.</p>
              <form className="flex flex-col space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition">
                  Subscribe
                </button>
              </form>
            </div>
            
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Danny's Connect. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>for Global Education</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}