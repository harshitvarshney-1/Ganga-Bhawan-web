const ContactMap = () => {
  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card h-full min-h-[360px]">
      <iframe
        title="Ganga Bhawan Location"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3535.1472433826457!2d77.57526867491988!3d27.619956029341473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39736d007b2888a7%3A0x2ce7440b2146a72e!2sGanga%20Bhawan%20%2C%20Hariom!5e0!3m2!1sen!2sin!4v1757059458458!5m2!1sen!2sin"
        className="w-full h-full min-h-[360px] grayscale hover:grayscale-0 transition-all duration-500"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

export default ContactMap;
