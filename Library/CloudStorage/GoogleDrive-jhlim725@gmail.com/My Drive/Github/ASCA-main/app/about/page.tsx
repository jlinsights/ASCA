import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TranslatedContent } from "@/components/translated-content"
import { Mail, MapPin, Phone, Clock } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider">
              <TranslatedContent textKey="aboutUs" />
            </p>
            <h1 className="text-5xl md:text-6xl font-normal uppercase">
              <TranslatedContent textKey="asiaCulturalAssociation" />
            </h1>
          </div>
          <div>
            <Image
              src="/placeholder.svg?height=500&width=1200"
              alt="Asian Calligraphy Cultural Association"
              width={1200}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 border-t border-[#222222]/10 dark:border-[#fcfcfc]/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <p className="text-xs uppercase tracking-wider">
              <TranslatedContent textKey="philosophy" />
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-lg md:text-xl leading-relaxed">
              <TranslatedContent textKey="philosophyText" />
            </p>
          </div>
        </div>
      </section>      {/* Vision & Mission */}
      <section className="container mx-auto px-4 py-16 md:py-24 border-t border-[#222222]/10 dark:border-[#fcfcfc]/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Vision */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-normal uppercase mb-4">
                <TranslatedContent textKey="ourVision" />
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                <TranslatedContent textKey="visionText" />
              </p>
            </div>
            <div>
              <Image
                src="/placeholder.svg?height=300&width=400"
                alt="Vision Image"
                width={400}
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Mission */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-normal uppercase mb-4">
                <TranslatedContent textKey="ourMission" />
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                <TranslatedContent textKey="missionText" />
              </p>
            </div>
            <div>
              <Image
                src="/placeholder.svg?height=300&width=400"
                alt="Mission Image"
                width={400}
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>      {/* History */}
      <section className="container mx-auto px-4 py-16 md:py-24 border-t border-[#222222]/10 dark:border-[#fcfcfc]/10">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider">
              <TranslatedContent textKey="ourHistory" />
            </p>
            <h2 className="text-4xl md:text-5xl font-normal uppercase">
              1995 - 2023
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1">
              <div className="border border-[#222222]/10 dark:border-[#fcfcfc]/10 p-6 text-center">
                <span className="text-4xl font-light">28</span>
                <p className="text-xs uppercase mt-2">Years</p>
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-sm md:text-base leading-relaxed">
                <TranslatedContent textKey="historyText" />
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="border border-[#222222]/10 dark:border-[#fcfcfc]/10 p-6 text-center">
              <span className="text-3xl font-light">200+</span>
              <p className="text-xs uppercase mt-2">Exhibitions</p>
            </div>
            <div className="border border-[#222222]/10 dark:border-[#fcfcfc]/10 p-6 text-center">
              <span className="text-3xl font-light">50+</span>
              <p className="text-xs uppercase mt-2">Countries</p>
            </div>
            <div className="border border-[#222222]/10 dark:border-[#fcfcfc]/10 p-6 text-center">
              <span className="text-3xl font-light">1000+</span>
              <p className="text-xs uppercase mt-2">Artists</p>
            </div>
          </div>
        </div>
      </section>      {/* Team */}
      <section className="container mx-auto px-4 py-16 md:py-24 border-t border-[#222222]/10 dark:border-[#fcfcfc]/10">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider">
              <TranslatedContent textKey="ourTeam" />
            </p>
            <h2 className="text-4xl md:text-5xl font-normal uppercase">
              Leadership
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Director */}
            <div className="space-y-4">
              <div>
                <Image
                  src="/placeholder.svg?height=300&width=300"
                  alt="Artistic Director"
                  width={300}
                  height={300}
                  className="w-full h-auto object-cover grayscale"
                />
              </div>
              <div>
                <h3 className="text-xl uppercase">
                  <TranslatedContent textKey="directorName" />
                </h3>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  <TranslatedContent textKey="directorTitle" />
                </p>
                <p className="text-sm mt-2 leading-relaxed">
                  <TranslatedContent textKey="directorBio" />
                </p>
              </div>
            </div>            {/* Curator */}
            <div className="space-y-4">
              <div>
                <Image
                  src="/placeholder.svg?height=300&width=300"
                  alt="Curator"
                  width={300}
                  height={300}
                  className="w-full h-auto object-cover grayscale"
                />
              </div>
              <div>
                <h3 className="text-xl uppercase">
                  <TranslatedContent textKey="curatorName" />
                </h3>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  <TranslatedContent textKey="curatorTitle" />
                </p>
                <p className="text-sm mt-2 leading-relaxed">
                  <TranslatedContent textKey="curatorBio" />
                </p>
              </div>
            </div>

            {/* Coordinator */}
            <div className="space-y-4">
              <div>
                <Image
                  src="/placeholder.svg?height=300&width=300"
                  alt="Cultural Education Coordinator"
                  width={300}
                  height={300}
                  className="w-full h-auto object-cover grayscale"
                />
              </div>
              <div>
                <h3 className="text-xl uppercase">
                  <TranslatedContent textKey="coordinatorName" />
                </h3>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  <TranslatedContent textKey="coordinatorTitle" />
                </p>
                <p className="text-sm mt-2 leading-relaxed">
                  <TranslatedContent textKey="coordinatorBio" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Contact Information */}
      <section className="bg-[#222222] text-[#fcfcfc] dark:bg-[#111111] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider">
                <TranslatedContent textKey="contactInfo" />
              </p>
              <h2 className="text-4xl md:text-5xl font-normal uppercase">
                Get in Touch
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-5 h-5 mt-1" />
                  <div>
                    <h3 className="text-sm uppercase tracking-wider mb-2">
                      <TranslatedContent textKey="location" />
                    </h3>
                    <p className="text-sm leading-relaxed">
                      <TranslatedContent textKey="locationText" />
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="w-5 h-5 mt-1" />
                  <div>
                    <h3 className="text-sm uppercase tracking-wider mb-2">
                      <TranslatedContent textKey="phone" />
                    </h3>
                    <p className="text-sm">+82-2-1234-5678</p>
                  </div>
                </div>                <div className="flex items-start space-x-4">
                  <Mail className="w-5 h-5 mt-1" />
                  <div>
                    <h3 className="text-sm uppercase tracking-wider mb-2">
                      <TranslatedContent textKey="email" />
                    </h3>
                    <p className="text-sm">info@asca-gallery.org</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Clock className="w-5 h-5 mt-1" />
                  <div>
                    <h3 className="text-sm uppercase tracking-wider mb-2">
                      <TranslatedContent textKey="hours" />
                    </h3>
                    <p className="text-sm">
                      <TranslatedContent textKey="hoursText" />
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Image
                  src="/placeholder.svg?height=400&width=500"
                  alt="Gallery Location"
                  width={500}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}