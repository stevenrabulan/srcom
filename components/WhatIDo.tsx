import Link from "next/link";

const services = [
  {
    title: "Build and optimize products that grow",
    description:
      "I'm a Growth Product Manager and Software Engineer with 12 years of experience in lead-generation, experimentation, and funnel optimization previously at CraftJack and Angi Home Services. I'm open to growth product manager and product-builder roles.",
  },
  {
    title: "Help local business owners get caught up with AI",
    description: "I help local business owners use AI to save time and get more customers. If I don't save you time, you don't pay.",
  },
  {
    title: "DJ & produce remixes",
    description: "I curate the best hip-hop and R&B remixes on the internet and upload DJ sets to",
    links: [
      { text: "Soundcloud", href: "https://soundcloud.com/steve-rabulan" },
      { text: "YouTube", href: "https://youtube.com/@djsteeeve" },
    ],
  },
];

export default function WhatIDo() {
  return (
    <section className="bg-light py-20">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">Here&#39;s what I do</h2>
        <div className="w-12 h-1 bg-primary mx-auto mb-12 rounded-full" />

        <div className="space-y-10">
          {services.map((service, index) => (
            <div key={index}>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
                {service.links && (
                  <>
                    {" "}
                    <Link href={service.links[0].href} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover font-medium transition-colors">
                      {service.links[0].text}
                    </Link>
                    {" and "}
                    <Link href={service.links[1].href} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover font-medium transition-colors">
                      {service.links[1].text}
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
