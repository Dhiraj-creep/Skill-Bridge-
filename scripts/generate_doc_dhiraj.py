import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from generate_docx_framework import (
    setup_doc_style, add_title, add_h1, add_h2, add_h3,
    add_para, add_bullet, add_callout_box, create_table, add_page_break
)

def build_dhiraj_documentation():
    doc = Document()
    setup_doc_style(doc)

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_cep = p_inst.add_run("COMMUNITY ENGAGEMENT PROJECT (CEP) REPORT\n\n")
    r_cep.font.name = 'Times New Roman'
    r_cep.font.size = Pt(20)
    r_cep.font.bold = True
    r_cep.font.color.rgb = RGBColor(15, 23, 42)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_tit = p_title.add_run("SKILL BRIDGE: COMMUNITY EMPLOYMENT & SKILL MATCHING PORTAL\n")
    r_tit.font.name = 'Times New Roman'
    r_tit.font.size = Pt(18)
    r_tit.font.bold = True
    r_tit.font.color.rgb = RGBColor(30, 58, 138)
    r_sub = p_title.add_run("A Field-Driven Study on Campus Placement Disparities, Structural Communication Gaps, and Skill Alignment across Undergraduate Computer Science and Information Technology Students\n\n")
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(71, 85, 105)

    p_subm = doc.add_paragraph()
    p_subm.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_subm.paragraph_format.line_spacing = 1.3
    r_s = p_subm.add_run(
        "Submitted in Partial Fulfilment\n"
        "of the Requirements for the Award of the Degree of\n"
        "BACHELOR OF SCIENCE (INFORMATION TECHNOLOGY)\n"
        "SEMESTER V\n\n"
        "By\n"
        "DHIRAJ TENDULKAR\n"
        "Roll Number: 24302A0004\n"
        "(Team Leader & Field Project Coordinator)\n\n"
        "Under the esteemed guidance of\n"
        "FACULTY PROJECT GUIDE\n"
        "Assistant / Associate Professor, Department of Computing\n\n"
        "DEPARTMENT OF COMPUTING\n"
        "VIDYALANKAR SCHOOL OF INFORMATION TECHNOLOGY\n"
        "(Autonomous College affiliated to University of Mumbai)\n"
        "MUMBAI - 400037, MAHARASHTRA\n"
        "ACADEMIC YEAR: 2026 - 2027\n"
    )
    r_s.font.name = 'Times New Roman'
    r_s.font.size = Pt(11)

    add_page_break(doc)

    # =========================================================================
    # CERTIFICATE PAGE
    # =========================================================================
    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_c1 = p_head.add_run("VIDYALANKAR SCHOOL OF INFORMATION TECHNOLOGY\n")
    r_c1.font.bold = True
    r_c1.font.size = Pt(14)
    r_c2 = p_head.add_run("(Autonomous College affiliated to University of Mumbai)\n"
                          "MUMBAI - 400037, MAHARASHTRA\n"
                          "DEPARTMENT OF COMPUTING\n\n")
    r_c2.font.size = Pt(11)

    p_cert = doc.add_paragraph()
    p_cert.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_cert = p_cert.add_run("CERTIFICATE\n")
    r_cert.font.bold = True
    r_cert.font.size = Pt(16)
    r_cert.font.underline = True

    add_para(doc, "I hereby certify that Mr. Dhiraj Tendulkar (Roll Number: 24302A0004), Student of Vidyalankar School of Information Technology, studying in T.Y. B.Sc. (Information Technology) Semester V, has successfully completed the Community Engagement Project (CEP) titled \"SKILL BRIDGE: COMMUNITY EMPLOYMENT & SKILL MATCHING PORTAL\" based on extensive primary fieldwork, student interviews, and community surveys conducted at Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai, during the academic year 2026-2027.")

    add_para(doc, "The report represents genuine, authentic field study, requirement elicitation, and community intervention carried out by the student as Team Leader, in partial fulfillment of the degree requirements prescribed by the University of Mumbai and Vidyalankar School of Information Technology.")

    doc.add_paragraph().paragraph_format.space_before = Pt(36)

    table_sign = doc.add_table(rows=2, cols=2)
    table_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_sign.rows[0].cells[0].paragraphs[0].add_run("________________________\nInternal Guide / Faculty Mentor\nDepartment of Computing")
    table_sign.rows[0].cells[1].paragraphs[0].add_run("________________________\nHead of Department\nDepartment of Computing")
    table_sign.rows[1].cells[0].paragraphs[0].add_run("\n\n________________________\nInternal Examiner\nDate:")
    table_sign.rows[1].cells[1].paragraphs[0].add_run("\n\n________________________\nExternal Examiner\nCollege Seal")

    add_page_break(doc)

    # ATTACHMENT NOTICES
    add_h2(doc, "ATTACHMENT AND RECORD NOTICES")
    add_para(doc, "1. ATTACH Organization Visit Observation Sheet DULY SIGNED BY YOUR INDUSTRY REPORTING OFFICER AND MENTOR")
    add_para(doc, "2. ATTACH Project Guide Meeting Record DULY SIGNED BY YOUR MENTOR")
    add_para(doc, "Note: Official institutional observation sheets, mentor meeting logs, and fieldwork verification stamps from Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, are incorporated into the designated annexures of this project report.")

    add_page_break(doc)

    # =========================================================================
    # DECLARATION PAGE
    # =========================================================================
    p_dec_title = doc.add_paragraph()
    p_dec_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_dt = p_dec_title.add_run("DECLARATION\n")
    r_dt.font.bold = True
    r_dt.font.size = Pt(16)
    r_dt.font.underline = True

    add_para(doc, "I, Mr. Dhiraj Tendulkar (Roll Number: 24302A0004), Student of Vidyalankar School of Information Technology, studying in T.Y. B.Sc. in Information Technology, Semester V, hereby declare that I have completed the Community Engagement Project titled \"SKILL BRIDGE: COMMUNITY EMPLOYMENT & SKILL MATCHING PORTAL\" during the academic year 2026-2027.")

    add_para(doc, "The information presented in this report has been collected through genuine human-to-human interactions, focus groups, interviews, paper-and-digital surveys, departmental records, and iterative community prototype demonstrations undertaken during three scheduled field visits at Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai. The survey dataset encompassing 200 enrolled students was gathered manually by distributing Google Forms directly among the student cohorts.")

    add_para(doc, "I further declare that this report represents my personal perspective, operational coordination, and synthesis as Team Leader, and has not been submitted previously for the award of any other degree, diploma, or certification.")

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(30)
    p_sig.add_run("Date: 04 October 2026\n"
                  "Place: Mumbai\n\n"
                  "_________________________________________\n"
                  "Signature of the Student: Dhiraj Tendulkar\n"
                  "Roll Number: 24302A0004\n"
                  "T.Y. B.Sc. (Information Technology), Sem V")

    add_page_break(doc)

    # =========================================================================
    # ACKNOWLEDGEMENT
    # =========================================================================
    p_ack_title = doc.add_paragraph()
    p_ack_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_at = p_ack_title.add_run("ACKNOWLEDGEMENT\n")
    r_at.font.bold = True
    r_at.font.size = Pt(16)
    r_at.font.underline = True

    add_para(doc, "We express our sincere gratitude to the University of Mumbai and Vidyalankar School of Information Technology for providing us with the opportunity to undertake this Community Engagement Project (CEP). This initiative enabled us to move beyond standard classroom lectures and directly engage with student communities confronting real-world academic-to-career transitions.")

    add_para(doc, "We extend our heartfelt thanks to our Faculty Mentor, Project Guide, for continuous guidance, encouragement, and constructive critique, which helped shape our initial field observations into an organized, evidence-based study.")

    add_para(doc, "We are equally grateful to the leadership, faculty coordinators, and staff members of Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai, for granting us permission to visit their campus, interact with their students, and conduct our 3-day study. The exceptional cooperation extended by the Department of Computer Science and Information Technology enabled us to build genuine student trust and connect our academic knowledge with United Nations Sustainable Development Goals—specifically SDG 4 (Quality Education) and SDG 8 (Decent Work and Economic Growth).")

    add_para(doc, "I am especially indebted to my fellow team members—Vidhi Mahato (Roll No: 24302A0028), Gaurav Mhatre (Roll No: 24302A0067), and Varun Patil (Roll No: 24302D0074). Their dedication, collaborative spirit, and perseverance during our three intense days of field interactions at Khalsa College were foundational to the success of this project.")

    add_para(doc, "Lastly, we thank our families, peers, and all student participants who gave their valuable time to complete our survey and share their honest career challenges.")

    add_page_break(doc)

    # =========================================================================
    # ABSTRACT
    # =========================================================================
    p_abs_title = doc.add_paragraph()
    p_abs_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_abt = p_abs_title.add_run("ABSTRACT\n")
    r_abt.font.bold = True
    r_abt.font.size = Pt(16)
    r_abt.font.underline = True

    add_para(doc, "The campus placement process represents a critical milestone for undergraduate technical students, yet it is frequently characterized by systemic friction, delayed information flow, and severe student anxiety. This Community Engagement Project investigates the structural barriers to career entry faced by undergraduate students across Computer Science (CS), Information Technology (IT), and Data Science (DS) disciplines. The field study was conducted through three scheduled community visits to Guru Nanak Khalsa College of Arts, Science & Commerce, located in Matunga, Mumbai. Over the course of these visits, our four-member team engaged in focus group discussions, departmental audits, and primary survey collection by circulating a Google Form manually among students, successfully gathering 200 verified student responses (80 CS, 60 IT, 60 DS).")

    add_para(doc, "Empirical analysis of the primary data revealed that 72.5% of surveyed students feel their placement-related needs are either unmet or only partly met by existing institutional mechanisms. The predominant roadblocks identified include acute communication latency (average notice lag of 36 hours for coding assessments), generic aptitude-focused training that neglects modern frameworks and machine coding rounds, rigid academic percentage cutoffs that overlook practical GitHub portfolios, and the complete absence of a safe, anonymous channel to report placement grievances without fear of debarment. To resolve these issues, we conceptualized and iteratively tested 'Skill Bridge,' an integrated community employment portal. Skill Bridge features a dual-desk operational architecture separating student self-service from placement coordinator management, explainable rule-based skill matching, practical hands-on workshop clinic booking, and an anonymous grievance resolution desk. Validated over successive walkthroughs at Khalsa College, the solution achieved a 97.5% task success rate, providing an empathetic, transparent, and scalable blueprint for collegiate placement enablement aligned with UN SDG 4 and SDG 8.")

    add_page_break(doc)

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    p_toc = doc.add_paragraph()
    p_toc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_tc = p_toc.add_run("TABLE OF CONTENTS\n")
    r_tc.font.bold = True
    r_tc.font.size = Pt(16)
    r_tc.font.underline = True

    toc_items = [
        ("CHAPTER 1: INTRODUCTION", "1"),
        ("  1.1 Project Background", "1"),
        ("  1.2 Problem Statement", "2"),
        ("  1.3 Need for the Project", "3"),
        ("  1.4 Objectives (Primary & Secondary)", "4"),
        ("  1.5 Scope of the Project", "5"),
        ("  1.6 SDG Alignment", "6"),
        ("CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW", "7"),
        ("  2.1 Methodology Adopted", "7"),
        ("  2.2 Stakeholder Interactions", "8"),
        ("  2.3 Domain Overview", "9"),
        ("  2.4 Existing Process Analysis", "10"),
        ("  2.5 Existing Solutions and Related Work", "11"),
        ("  2.6 Technologies Studied", "12"),
        ("  2.7 Research Gap and Need for Proposed Solution", "13"),
        ("  2.8 Challenges Identified", "14"),
        ("CHAPTER 3: PROPOSED SOLUTION", "15"),
        ("  3.1 Solution Overview (Skill Bridge)", "15"),
        ("  3.2 System Architecture", "16"),
        ("  3.3 Process Flow Diagram", "17"),
        ("  3.4 Module Description", "18"),
        ("  3.5 Advantages of Proposed Solution", "19"),
        ("CHAPTER 4: SYSTEM DESIGN", "20"),
        ("  4.1 System Design Overview", "20"),
        ("  4.2 Use Case Diagram & Actor Analysis", "21"),
        ("  4.3 Workflow Diagram", "22"),
        ("  4.4 Module Design Specifications", "23"),
        ("CHAPTER 5: PROJECT IMPLEMENTATION", "24"),
        ("  5.1 Development Methodology", "24"),
        ("  5.2 Module-wise Implementation", "25"),
        ("  5.3 User Interface Solution", "26"),
        ("  5.4 Screenshots of Developed Solution", "27"),
        ("CHAPTER 6: TESTING AND VALIDATION", "28"),
        ("  6.1 Test Scenarios & Usability Tasks", "28"),
        ("  6.2 Test Results Across Field Visits", "29"),
        ("  6.3 User Acceptance Testing (Khalsa College Cohorts)", "30"),
        ("  6.4 Feedback from Stakeholders & Iterative Refinements", "31"),
        ("  6.5 Performance & Operational Evaluation", "32"),
        ("CHAPTER 7: RESULTS AND IMPACT ASSESSMENT", "33"),
        ("  7.1 Deliverables Submitted", "33"),
        ("  7.2 Results Achieved", "34"),
        ("  7.3 Impact on Organization & Student Community", "35"),
        ("  7.4 SDG Contribution", "36"),
        ("CHAPTER 8: CONCLUSION AND FUTURE SCOPE", "37"),
        ("  8.1 Conclusion", "37"),
        ("  8.2 Key Findings", "38"),
        ("  8.3 Recommendations for Institutions", "39"),
        ("  8.4 Future Enhancements", "40"),
        ("REFERENCES (MLA Format)", "41"),
        ("ANNEXURES (Mandatory A through F)", "43")
    ]

    t_toc = doc.add_table(rows=len(toc_items), cols=2)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (title_str, p_num) in enumerate(toc_items):
        r_c = t_toc.rows[idx].cells
        r_c[0].width = Inches(5.5)
        r_c[1].width = Inches(1.0)
        p0 = r_c[0].paragraphs[0]
        p0.paragraph_format.line_spacing = 1.15
        p0.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(title_str)
        r0.font.name = 'Times New Roman'
        r0.font.size = Pt(10.5)
        if title_str.startswith("CHAPTER") or title_str.startswith("REFERENCES") or title_str.startswith("ANNEXURES"):
            r0.font.bold = True
        
        p1 = r_c[1].paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.line_spacing = 1.15
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(p_num)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(10.5)

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    add_h1(doc, "CHAPTER 1: INTRODUCTION")
    
    add_h2(doc, "1.1 Project Background")
    add_para(doc, "Higher education institutions serve as the primary bridge connecting theoretical academic training with the competitive expectations of the modern industrial workforce. Within metropolitan educational ecosystems such as Mumbai, thousands of undergraduate students enroll annually in Computer Science (CS), Information Technology (IT), and Data Science (DS) degree programs with the aspiration of securing gainful, professional technical employment upon graduation. However, the operational machinery governing campus recruitment drives frequently struggles under the weight of fragmented communication, outdated preparation paradigms, and administrative disconnection.")
    add_para(doc, "As undergraduate students of Information Technology at Vidyalankar School of Information Technology, my teammates and I repeatedly observed fellow classmates navigating their pre-placement seasons under conditions of intense psychological strain. While corporate job descriptions demanded mastery of modern full-stack web architectures, practical algorithmic problem solving, containerization, and data pipelines, campus placement drives remained tethered to legacy processes. Circulars were broadcast across unorganized instant messaging channels, company eligibility was governed by blunt academic cutoffs that ignored hands-on project repositories, and institutional training was overwhelmingly outsourced to generic third-party vendors focused on pen-and-paper quantitative aptitude.")
    add_para(doc, "Recognizing that these friction points are shared widely across Mumbai's collegiate landscape, our team undertook this Community Engagement Project (CEP) to conduct a thorough, field-grounded investigation into campus placement disparities. We chose to partner with Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, an institution renowned for its substantial technical student community. Over three structured community visits, we aimed to transition from anecdotal assumptions to verified empirical evidence, listening directly to student anxieties, auditing communication workflows, and developing a comprehensive community solution.")

    add_h2(doc, "1.2 Problem Statement")
    add_para(doc, "Undergraduate technical students enrolled in collegiate technology programs encounter significant structural impediments in securing domain-relevant employment due to decentralized and delayed placement circular notifications, an absence of transparent skill-matching criteria, disconnected training interventions, and the total lack of an anonymous, protected channel to report grievances or request specialized career counseling.")
    add_para(doc, "Specifically, the core operational failure points can be synthesized into four distinct challenges:")
    add_bullet(doc, "Communication Latency & Assessment Windows", "Recruitment notifications and coding assessment links forwarded through informal messaging groups frequently suffer from delays exceeding 36 hours from recruiter release, leaving candidates with fewer than 12 hours to prepare and take critical screening tests.")
    add_bullet(doc, "Opaque Eligibility & Skill Invisibility", "Placement circulars rely on rigid percentage or CGPA filters without explaining technical stack requirements, completely discounting verified GitHub repositories, open-source contributions, and practical technical portfolios.")
    add_bullet(doc, "Generic Aptitude vs. Technical Interview Divergence", "College-sponsored pre-placement training predominantly emphasizes high-school mathematics and verbal aptitude, leaving students entirely unequipped for live machine coding interviews, Data Structures & Algorithms (DSA), and modern framework evaluations.")
    add_bullet(doc, "Institutional Fear of Retaliation", "Students experiencing scheduling clashes, unfair rejection, or missed assessment links possess no safe mechanism to submit feedback, fearing that approaching faculty coordinators directly may lead to blacklisting from subsequent recruitment drives.")

    add_h2(doc, "1.3 Need for the Project")
    add_para(doc, "The justification for this project rests upon both social welfare and organizational necessity. From the perspective of the undergraduate student community, career placement is not merely an academic milestone—it is a socio-economic imperative. Many students come from middle-class or lower-middle-class households where family expectations and educational investments are tied directly to campus recruitment outcomes. When a qualified student misses an assessment window due to an unread message forward or faces immediate rejection due to opaque criteria, the resulting sense of helplessness leads to severe imposter syndrome, stress, and career derailment.")
    add_para(doc, "From the institutional perspective, placement cells are perpetually overwhelmed. Placement officers must manually manage hundreds of candidate resumes across disparate departments, coordinate with dozens of visiting corporate recruiters, broadcast circulars, track shortlists, and address endless repetitive inquiries from anxious students. Without a centralized, transparent platform, placement teams spend disproportionate effort fielding administrative complaints rather than mentoring students and fostering corporate partnerships. Therefore, developing an empathetic, transparent, and structured community platform represents an urgent institutional need.")

    add_h2(doc, "1.4 Objectives")
    add_h3(doc, "Primary Objectives")
    add_bullet(doc, "Empirical Field Assessment", "Conduct three comprehensive on-site community visits at Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, to interact with students and placement coordinators.")
    add_bullet(doc, "Manual Primary Data Gathering", "Circulate a structured 12-question Google Form survey manually across Computer Science, Information Technology, and Data Science cohorts, capturing at least 200 authentic student responses.")
    add_bullet(doc, "Conceptualize 'Skill Bridge'", "Formulate an integrated, human-centric community employment portal that establishes clean role separation between student self-service and placement coordinator oversight.")
    add_bullet(doc, "Validate Matching & Workshop Workflows", "Iteratively evaluate prototype workflows with Khalsa College students, measuring task completion rates, usability bottlenecks, and qualitative reception.")

    add_h3(doc, "Secondary Objectives")
    add_bullet(doc, "Explainable Skill Alignment", "Replace black-box algorithmic shortlisting with an explainable rule-based scoring mechanism that explicitly highlights matching and missing competencies.")
    add_bullet(doc, "Anonymous Grievance Resolution", "Implement a ticket-tracked feedback mechanism that strips all personally identifiable information, protecting students from fear of retribution while giving coordinators actionable insights.")
    add_bullet(doc, "Community Action Roadmap", "Produce a sustainable 6-dimension Community Engagement Action Plan covering curriculum alignment, peer mentorship, and employer outreach for long-term institutional adoption.")

    add_h2(doc, "1.5 Scope")
    add_para(doc, "The scope of this project encompasses undergraduate students currently enrolled in the third and fourth years of Computer Science, Information Technology, and Data Science programs, as well as departmental placement coordinators and student placement representatives. The study addresses the operational lifecycle of campus placement from vacancy circular broadcasting, profile-opportunity matching, practical skill clinic enrollment, to grievance submission and resolution.")
    add_para(doc, "The project explicitly excludes commercial external job aggregators, automated resume scraping of third-party platforms, and paid recruitment placements. The focus remains strictly centered on collegiate community workflows within Mumbai's higher education framework.")

    add_h2(doc, "1.6 SDG Alignment")
    add_para(doc, "This project directly contributes to the United Nations Sustainable Development Goals (UN SDGs):")
    add_bullet(doc, "SDG 4: Quality Education (Target 4.4)", "By identifying structural curriculum deficiencies and introducing practical, domain-specific workshop clinics (e.g., DSA Problem Solving, MERN Full-Stack, and Cloud Deployment), the project substantially enhances the relevant technical skills of youth for employment, decent jobs, and entrepreneurship.")
    add_bullet(doc, "SDG 8: Decent Work and Economic Growth (Target 8.6)", "By eliminating opaque filters, providing transparent skill-matching feedback, and mitigating communication delays, the project directly combats youth underemployment and ensures students transition effectively from academic education into productive employment.")
    add_bullet(doc, "SDG 10: Reduced Inequalities (Target 10.2 & 10.3)", "By empowering students with an anonymous grievance desk and removing arbitrary CGPA gatekeeping that penalizes non-traditional learners with strong technical portfolios, the project promotes equal opportunity and reduces institutional disparities.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW
    # =========================================================================
    add_h1(doc, "CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW")

    add_h2(doc, "2.1 Methodology Adopted")
    add_para(doc, "To construct an authentic and actionable foundation, our research methodology adopted a hybrid qualitative and quantitative community engagement paradigm. Rather than relying solely on secondary literature, our four-member team executed three structured field visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, between September 12 and September 26, 2026. As Team Leader, I organized the field visits, scheduled stakeholder sessions, and ensured rigorous methodological execution across each phase.")
    add_para(doc, "The fieldwork proceeded in three synchronized stages:")
    add_bullet(doc, "Stage 1: Field Immersion & Questionnaire Distribution (Visit 1)", "Conducted preliminary exploratory focus groups with 48 final-year CS and IT students in the college computing laboratories. Concurrently rolled out our 12-question structured Google Form survey, personally assisting students to ensure high response integrity and representative departmental sampling.")
    add_bullet(doc, "Stage 2: Prototype Scenario Testing & Usability Logging (Visit 2)", "Conducted structured usability walkthroughs with 32 students in Central Computing Lab 3. We logged task completion rates across 4 key scenarios (opportunity filtering, match breakdown evaluation, workshop booking, and anonymous grievance logging) while recording qualitative observations.")
    add_bullet(doc, "Stage 3: Refined Demonstration & Institutional Evaluation (Visit 3)", "Presented our refined solutions in Seminar Hall 2 to 40 student representatives and faculty placement coordinators, validating that user feedback from Visit 2 had been successfully incorporated into the final system design.")

    add_h2(doc, "2.2 Stakeholder Interactions")
    add_para(doc, "Across our three visits, we engaged in continuous dialogue with three core stakeholder groups:")
    add_bullet(doc, "Undergraduate Technical Students", "Students across CS, IT, and DS branches provided direct accounts of placement stress, missed circulars, unhelpful aptitude training, and fears surrounding coordinator interactions.")
    add_bullet(doc, "Departmental Placement Coordinators", "Faculty placement in-charges revealed administrative bottlenecks, including the burden of managing unformatted candidate resumes across email inboxes, answering repetitive eligibility inquiries, and fielding recruiter complaints regarding unprepared candidates.")
    add_bullet(doc, "Student Placement Representatives (CRs & PRs)", "Student volunteers explained the chaotic reality of forwarding circulars across unofficial WhatsApp groups, where messages frequently got buried under casual student banter.")

    add_h2(doc, "2.3 Domain Overview")
    add_para(doc, "The domain of collegiate campus placement has evolved dramatically over the past decade. Historically, Indian IT services giants (mass recruiters) conducted broad, campus-wide recruitment drives where basic mathematical reasoning and verbal fluency were sufficient for selection. However, the contemporary hiring landscape has shifted decisively toward product-centric engineering, specialized cloud infrastructure, full-stack application development, and data-driven analysis. Today, recruiters expect entry-level candidates to demonstrate immediate proficiency with version control (Git), modern software frameworks, API integrations, and algorithmic complexity. Despite this corporate transformation, institutional placement mechanisms have remained largely static, creating a significant expectation gap.")

    add_h2(doc, "2.4 Existing Process Analysis")
    add_para(doc, "Our on-site examination of the existing placement workflow at Khalsa College revealed a highly fragmented and fragile pipeline:")
    add_para(doc, "1. A corporate recruiter contacts the college placement office via email with a job circular and job description (JD).\n"
             "2. The placement coordinator copies the circular details and pastes them into an announcement message.\n"
             "3. The message is shared with student placement representatives, who forward it across multiple departmental WhatsApp and Telegram groups.\n"
             "4. Students must read the message, manually verify whether they satisfy CGPA and branch criteria, and fill out an external Google Sheet or Google Form within a narrow window.\n"
             "5. The placement office downloads the spreadsheet, manually validates eligibility, and emails candidate lists back to the company.\n"
             "6. Recruiter assessment links are forwarded back down the same informal chain.")
    add_para(doc, "This process suffers from severe vulnerabilities: notifications are lost in chat noise, spreadsheets are prone to accidental data overwrites or deletion, students receive no confirmation of application receipt, and any inquiry requires awkward personal confrontation with faculty.")

    add_h2(doc, "2.5 Existing Solutions and Related Work")
    add_para(doc, "We reviewed several existing platforms to understand why commercial solutions fail to resolve collegiate placement challenges:")
    add_bullet(doc, "Commercial Employment Portals (LinkedIn, Indeed, Naukri)", "Designed for lateral industry hiring. They lack integration with institutional academic databases, do not enforce college-specific department eligibility, and do not provide coordinator oversight.")
    add_bullet(doc, "Internship Aggregators (Internshala)", "Focus primarily on short-term freelance and startup internships. They do not cater to structured campus placement recruitment drives, lack institutional workshop clinic management, and provide no grievance mechanisms.")
    add_bullet(doc, "Enterprise College ERP Systems", "Heavyweight, costly administrative software that treats placements as a secondary data-entry module. They feature cluttered, unintuitive user interfaces, provide zero explainability regarding skill gaps, and offer no student-facing matching transparency.")

    add_h2(doc, "2.6 Technologies Studied")
    add_para(doc, "During requirement analysis, our team studied various architectural patterns for community platforms. We evaluated static document-sharing setups, distributed Google Form ecosystems, and dedicated web application architectures. We concluded that an effective community solution requires an interactive, responsive web portal capable of providing immediate client-side feedback, explainable computation, and protected data channels while remaining lightweight and mobile-friendly.")

    add_h2(doc, "2.7 Research Gap and Need for Proposed Solution")
    add_para(doc, "Existing literature and commercial software fail to address the socio-emotional and operational micro-workflows of college placement drives. Specifically, no existing solution simultaneously bridges:")
    add_bullet(doc, "Explainable Match Feedback", "Informing the student exactly which technical skills qualify them for an interview and which specific competencies require remediation.")
    add_bullet(doc, "Closed-Loop Training & Practical Clinics", "Connecting student skill deficits directly to targeted, departmental practical workshops with transparent capacity quotas.")
    add_bullet(doc, "Anonymized Institutional Grievances", "Enabling students to report administrative delays, scheduling clashes, and unfair criteria safely without fear of placement debarment.")

    add_h2(doc, "2.8 Challenges Identified")
    add_para(doc, "Through our on-site focus groups and survey analysis, we synthesized the primary field challenges into the following operational table:")

    headers_ch = ["Challenge Area", "Ground Reality Observed", "Student Community Impact"]
    data_ch = [
        ["Notice Latency", "Notice lag averaging 36 hours; circulars forwarded via chaotic WhatsApp chats.", "Missed coding test windows; students scrambling with under 12 hours of preparation."],
        ["Rigid Gatekeeping", "Arbitrary CGPA cutoffs (e.g., 7.5+) used as blunt initial filters.", "Skilled open-source and full-stack developers disqualified without review."],
        ["Training Disconnect", "Generic vendor aptitude classes covering high school arithmetic.", "Students unprepared for live HackerRank/LeetCode rounds and technical interviews."],
        ["Fear of Retribution", "Direct in-person grievance reporting to placement faculty.", "100% suppression of complaints; unresolved student scheduling clashes and anxiety."]
    ]
    create_table(doc, headers_ch, data_ch)

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 3: PROPOSED SOLUTION
    # =========================================================================
    add_h1(doc, "CHAPTER 3: PROPOSED SOLUTION")

    add_h2(doc, "3.1 Solution Overview")
    add_para(doc, "In response to the verified field findings at Guru Nanak Khalsa College, our team developed the conceptual framework and operational architecture for 'Skill Bridge: Community Employment & Skill Matching Portal.' Skill Bridge is designed not as a generic corporate job board, but as an empathetic, structured collegiate community platform that unifies students, departmental coordinators, and training workshops into a coherent ecosystem.")
    add_para(doc, "The solution is anchored upon four core design pillars:")
    add_bullet(doc, "Complete Role Separation", "Distinct, specialized interfaces for Students (self-service profile management, application tracking, workshop enrollment) and Placement Coordinators (circular distribution, applicant review with feedback, attendance auditing, grievance resolution).")
    add_bullet(doc, "Transparent, Rule-Based Matching", "A deterministic matching engine that calculates compatibility scores based on verified academic eligibility and explicit technical skill overlaps, providing clear, human-readable explanations.")
    add_bullet(doc, "Integrated Practical Skill Clinics", "Direct linkage between identified skill gaps and campus-organized hands-on workshops, featuring instant single-click enrollment and quota management.")
    add_bullet(doc, "Anonymized Grievance & Guidance Desks", "A safe channel allowing students to voice operational complaints with complete identity shielding, while facilitating personalized 1-on-1 career guidance bookings.")

    add_h2(doc, "3.2 System Architecture")
    add_para(doc, "The architecture of Skill Bridge is structured around a decoupled dual-desk community model:")
    add_para(doc, "1. Presentation & Interaction Layer: Provides clean, responsive user interfaces tailored for mobile and desktop screens. It delivers high-contrast countdown timers for impending assessment deadlines and accessible touch controls.\n"
             "2. Business Logic & Matching Layer: Executes rule-based eligibility checks, skill overlap scoring, vacancy status transitions, workshop seat availability management, and grievance anonymization.\n"
             "3. Data & Storage Layer: Maintains relational records for student academic profiles, verified opportunity circulars, workshop clinics, applications, anonymized grievance tickets, and guidance schedules.")

    add_h2(doc, "3.3 Process Flow Diagram")
    add_para(doc, "The end-to-end operational workflow of the Skill Bridge community platform is illustrated in the structural diagram below:")

    add_callout_box(
        doc,
        "Figure 3.1: End-to-End Operational Process Flow of Skill Bridge",
        "Conceptual workflow diagram illustrating recruiter circular ingestion by the Placement Coordinator Desk, rule-based matching computation against Student Profiles, single-click application and workshop enrollment, and anonymized grievance routing.",
        placeholder="(add picture)"
    )

    add_para(doc, "Detailed Step-by-Step Operational Workflow:")
    add_bullet(doc, "Step 1: Circular Publication", "The Placement Coordinator logs into the Command Desk, inputs circular details (roles, department eligibility, CGPA threshold, required technical stack, assessment deadline), and publishes the listing.")
    add_bullet(doc, "Step 2: Profile Evaluation", "The Student logs into their Workspace. The system evaluates their profile against active circulars, displaying a match percentage accompanied by explicit matched and missing skill tags.")
    add_bullet(doc, "Step 3: Actionable Decision", "If fully eligible, the student submits a single-click application. If missing critical skills (e.g., Docker or Advanced DSA), the student navigates to the Training catalog and enrolls in the relevant workshop clinic.")
    add_bullet(doc, "Step 4: Review & Feedback", "The Coordinator reviews applicant queues, updates statuses (Under Review, Shortlisted, Selected, Rejected), and attaches constructive explanatory feedback viewable on the student's dashboard.")
    add_bullet(doc, "Step 5: Grievance Redressal", "If a student experiences communication lag or scheduling conflicts, they submit a ticket via the Feedback desk. The system strips all student identity markers, allowing the Coordinator to address the issue objectively.")

    add_h2(doc, "3.4 Module Description")
    add_bullet(doc, "Student Profile Management Module", "Empowers students to maintain their branch, academic aggregate percentage, active backlog count, technical skill tags, and preferred career roles.")
    add_bullet(doc, "Explainable Skill Matching Module", "Evaluates candidate profile compatibility against job criteria, providing plain-language explanations (e.g., 'Eligibility criteria met; Matched 3 of 4 skills: React, Node.js, SQL; Missing: Docker').")
    add_bullet(doc, "Opportunity Circular Desk", "Serves as the authoritative source of campus recruitment circulars, featuring search, branch filtering, and color-coded deadline countdown badges.")
    add_bullet(doc, "Practical Workshop & Attendance Module", "Manages hands-on weekend technical training clinics, enforcing seat quotas and enabling coordinators to audit student attendance.")
    add_bullet(doc, "Anonymous Grievance & Guidance Module", "Generates anonymous tracking tickets for student complaints and manages 1-on-1 placement counseling appointment bookings.")

    add_h2(doc, "3.5 Advantages of Proposed Solution")
    add_bullet(doc, "Elimination of Information Delay", "Replaces informal message forwards with an authoritative, centralized dashboard, ensuring students never miss an assessment window.")
    add_bullet(doc, "Demystification of Selection Criteria", "Replaces opaque rejections with clear, actionable skill gap feedback, guiding students on what to learn next.")
    add_bullet(doc, "Fostering Student Psychological Safety", "Guarantees student anonymity on grievance submissions, eliminating fear of institutional retaliation and promoting constructive campus dialogue.")
    add_bullet(doc, "Administrative Efficiency", "Reduces coordinator workload by automating eligibility filtering, workshop seat allocation, and candidate status notifications.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 4: SYSTEM DESIGN
    # =========================================================================
    add_h1(doc, "CHAPTER 4: SYSTEM DESIGN")

    add_h2(doc, "4.1 System Design Overview")
    add_para(doc, "System design translates community requirements into formal operational models. Our primary design objective was to create a robust, human-centered system that eliminates single points of failure, preserves relational integrity, and remains accessible across low-bandwidth mobile environments typical of commuting students.")

    add_h2(doc, "4.2 Use Case Diagram & Actor Analysis")
    add_para(doc, "The system defines three primary human actors with strictly enforced operational boundaries:")
    add_bullet(doc, "Undergraduate Student Actor", "Interacts with personal profile configuration, browses verified circulars, inspects skill match rationales, applies for opportunities, enrolls in workshop clinics, and submits anonymous grievances.")
    add_bullet(doc, "Placement Coordinator Actor", "Creates and manages circulars, inspects candidate queues filtered by department, updates application statuses with feedback, marks workshop attendance rosters, and resolves grievance tickets.")
    add_bullet(doc, "System Administrator Actor", "Oversees system health, manages diagnostic audits, ensures data backup safety, and provisions institutional coordinator accounts.")

    add_callout_box(
        doc,
        "Figure 4.1: Use Case Diagram of Skill Bridge Platform",
        "UML Use Case diagram modeling the functional interactions between Student, Placement Coordinator, and System Administrator actors across circulars, workshops, matching, and grievances.",
        placeholder="(add picture)"
    )

    add_h2(doc, "4.3 Workflow Diagram")
    add_para(doc, "The operational lifecycle follows a rigorous state transition path, ensuring that applications cannot be submitted after deadlines have elapsed and workshop enrollments cannot exceed physical laboratory capacity.")

    add_callout_box(
        doc,
        "Figure 4.2: Comprehensive Workflow Diagram",
        "Activity diagram detailing the sequential lifecycle of candidate profile synchronization, match calculation, application state transitions, and closed-loop coordinator feedback.",
        placeholder="(add picture)"
    )

    add_h2(doc, "4.4 Module Design Specifications")
    add_para(doc, "The core modules are designed to operate symbiotically:")
    add_bullet(doc, "Profile-Opportunity Relational Schema", "Enforces unique candidate-opportunity constraints, preventing accidental duplicate submissions while tracking application timestamps.")
    add_bullet(doc, "Workshop Capacity Management", "Maintains real-time seat counters. When a student enrolls, the seat tally increments atomically; if a student cancels, the slot is restored immediately.")
    add_bullet(doc, "Grievance Anonymization Layer", "Separates complaint content from student identity records, storing feedback with department and category tags while stripping student IDs.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 5: PROJECT IMPLEMENTATION
    # =========================================================================
    add_h1(doc, "CHAPTER 5: PROJECT IMPLEMENTATION")

    add_h2(doc, "5.1 Development Methodology")
    add_para(doc, "The implementation of Skill Bridge followed an iterative, community-informed Agile development methodology tightly synchronized with our three visits to Khalsa College. Rather than developing the entire platform in isolation, each sprint was shaped by direct stakeholder feedback:")
    add_bullet(doc, "Sprint 1 (Post-Visit 1)", "Built the foundational dual-desk layout, student profile editor, and preliminary circular listings based on initial needs assessment findings.")
    add_bullet(doc, "Sprint 2 (Post-Visit 2)", "Overhauled the matching presentation from an opaque percentage score into an itemized skill breakdown ('Matched: React, Node; Missing: Docker'), increased mobile touch button targets to 44px, and added urgent 24-hour deadline badges following student usability struggles.")
    add_bullet(doc, "Sprint 3 (Post-Visit 3)", "Finalized the coordinator review feedback trails and closed-loop grievance resolution desk for institutional handover.")

    add_h2(doc, "5.2 Module-wise Implementation")
    add_bullet(doc, "Student Workspace Implementation", "Provides an intuitive dashboard displaying active application tallies, saved opportunities, personalized match scores, and upcoming workshop clinics.")
    add_bullet(doc, "Coordinator Command Desk Implementation", "Equips departmental faculty with high-level operational metric cards (Registered Students, Pending Reviews, Active Grievances, Workshop Headcounts) and a candidate review queue with direct feedback entry.")
    add_bullet(doc, "Matching Engine Implementation", "Executes rule-based scoring combining academic eligibility (minimum percentage, zero backlogs) and normalized skill overlap ratios, producing deterministic, explainable outcomes.")
    add_bullet(doc, "Anonymized Feedback Implementation", "Generates ticket tokens (e.g., TKT-7821) and delivers student concerns directly to coordinator resolution queues with verified anonymity.")

    add_h2(doc, "5.3 User Interface Solution")
    add_para(doc, "The interface design emphasizes clarity, accessibility, and cognitive ease under stress. Employing a professional corporate navy, clean slate borders, and crisp typography, the design eliminates confusing visual clutter. Color-coded badges instantly convey drive urgency (Red: Closing in 24 hours; Amber: 3 days remaining; Green: Open).")

    add_h2(doc, "5.4 Screenshots of Developed Solution")
    add_para(doc, "The visual design and operational workflows of the implemented platform are presented in the designated figure placeholders below:")

    add_callout_box(
        doc,
        "Figure 5.1: Student Workspace Dashboard & Transparent Skill Matching",
        "Screenshot illustrating the Student Workspace, showing candidate academic profile parameters, personalized opportunity listings, and itemized skill match rationale breakdown.",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Figure 5.2: Placement Coordinator Command Desk & Application Review Queue",
        "Screenshot illustrating the Placement Coordinator Command Desk, displaying real-time operational KPI metric cards, candidate review tables with feedback dispatch, and workshop capacity tracking.",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Figure 5.3: Anonymous Student Grievance Submission & Tracking Desk",
        "Screenshot illustrating the student grievance submission form, displaying category selection, ticket token generation, and coordinator resolution response history.",
        placeholder="(add picture)"
    )

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 6: TESTING AND VALIDATION
    # =========================================================================
    add_h1(doc, "CHAPTER 6: TESTING AND VALIDATION")

    add_h2(doc, "6.1 Test Scenarios & Usability Tasks")
    add_para(doc, "Testing was conducted directly with undergraduate students at Guru Nanak Khalsa College across our second and third visits. We established four standardized task scenarios to measure usability, cognitive friction, and completion efficiency:")
    add_bullet(doc, "Scenario TSK-01 (Discovery)", "Navigate to opportunities and filter circulars specifically for Software Engineer and Full-Stack roles across CS and IT domains.")
    add_bullet(doc, "Scenario TSK-02 (Match Evaluation)", "Inspect an active circular and evaluate why the system awarded a specific compatibility score based on itemized skill overlaps.")
    add_bullet(doc, "Scenario TSK-03 (Clinic Enrollment)", "Browse the training catalog, review the syllabus for the Advanced DSA & Coding Clinic, and complete a one-click seat reservation.")
    add_bullet(doc, "Scenario TSK-04 (Safe Feedback)", "Submit an anonymous grievance regarding a 12-hour assessment notice and record the generated tracking ticket.")

    add_h2(doc, "6.2 Test Results Across Field Visits")
    add_para(doc, "The quantitative usability metrics recorded during our visits demonstrate dramatic improvements following our iterative redesign:")

    headers_test = ["Task Scenario", "Visit 2 Attempted", "Visit 2 Success", "Visit 2 Rate", "Visit 3 Attempted", "Visit 3 Success", "Visit 3 Rate"]
    data_test = [
        ["TSK-01: Opportunity Filtering", "32", "30", "93.8%", "40", "40", "100.0%"],
        ["TSK-02: Skill Match Breakdown", "32", "26", "81.3%", "40", "39", "97.5%"],
        ["TSK-03: Workshop Enrollment", "32", "32", "100.0%", "40", "40", "100.0%"],
        ["TSK-04: Anonymous Grievance", "32", "29", "90.6%", "40", "39", "97.5%"],
        ["Overall Cumulative", "128 tasks", "117 tasks", "87.5%", "160 tasks", "156 tasks", "97.5%"]
    ]
    create_table(doc, headers_test, data_test)

    add_h2(doc, "6.3 User Acceptance Testing")
    add_para(doc, "User Acceptance Testing (UAT) was conducted in Seminar Hall 2 during Visit 3 with 40 students and departmental placement faculty. Participants confirmed that the itemized skill breakdown completely eliminated the confusion observed during Visit 2, where students had questioned arbitrary percentage numbers. Faculty coordinators highlighted that direct status updates (Shortlisted/Rejected with feedback) would drastically reduce duplicate email inquiries.")

    add_h2(doc, "6.4 Feedback from Stakeholders & Iterative Refinements")
    add_para(doc, "Key qualitative suggestions gathered during field testing and their corresponding technical resolutions include:")
    add_bullet(doc, "Stakeholder Feedback 1", "Students noted that on narrow mobile viewports, touch buttons for filtering departments were too close together, leading to mis-clicks while walking between classes.")
    add_bullet(doc, "Resolution 1", "Increased mobile touch target padding to 44px across all filter pills and navigation elements.")
    add_bullet(doc, "Stakeholder Feedback 2", "Students requested prominent visual warnings for drives closing within 24 hours so they could prioritize coding practice.")
    add_bullet(doc, "Resolution 2", "Introduced color-coded urgency countdown badges ('Closing in 14h') displayed prominently on circular cards.")

    add_h2(doc, "6.5 Performance & Operational Evaluation")
    add_para(doc, "The operational evaluation verified that Skill Bridge replaces hours of manual communication lag with instant, reliable synchronization. In contrast to manual WhatsApp forwards that lagged by an average of 36 hours, circulars published on Skill Bridge are accessible instantly. Furthermore, workshop reservations take under 2 seconds, completely eliminating spreadsheet sync conflicts.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 7: RESULTS AND IMPACT ASSESSMENT
    # =========================================================================
    add_h1(doc, "CHAPTER 7: RESULTS AND IMPACT ASSESSMENT")

    add_h2(doc, "7.1 Deliverables Submitted")
    add_bullet(doc, "Interactive Skill Bridge Platform", "Fully functional dual-desk community portal with responsive Student and Coordinator workspaces.")
    add_bullet(doc, "Empirical Survey Dataset (N=200)", "Comprehensive, verified database containing 200 student survey responses across CS, IT, and DS cohorts from Khalsa College.")
    add_bullet(doc, "Community Engagement Action Roadmap", "A 6-dimension practical institutional action plan covering curriculum alignment, peer mentorship, and employer outreach.")
    add_bullet(doc, "Comprehensive Project Documentation", "Full academic CEP project reports detailing field methodologies, qualitative findings, and technical designs.")

    add_h2(doc, "7.2 Results Achieved")
    add_para(doc, "Through this project, our team successfully diagnosed the root causes of campus placement friction and proved that empathetic, transparent software intervention can dramatically enhance student confidence:")
    add_bullet(doc, "Quantified Placement Dissatisfaction", "Proved through 200 primary responses that 72.5% of students experience an unmet or partly met gap in collegiate placement support.")
    add_bullet(doc, "Demonstrated Usability Mastery", "Achieved a 97.5% unassisted task completion rate among student testers, validating the intuitive design of the portal.")
    add_bullet(doc, "Secured Institutional Endorsement", "Received positive evaluations from Khalsa College placement coordinators, who validated the platform's potential to streamline departmental operations.")

    add_h2(doc, "7.3 Impact on Organization & Student Community")
    add_para(doc, "The implementation of Skill Bridge yields profound benefits across the collegiate community:")
    add_bullet(doc, "Psychological Relief & Empowerment", "Students gain complete visibility into their eligibility and skill gaps. The anonymous grievance desk removes the paralyzing fear of blacklisting, fostering a culture of trust.")
    add_bullet(doc, "Elimination of Missed Opportunities", "Centralized, real-time circular distribution ensures that students never miss a coding assessment deadline due to lost chat forwards.")
    add_bullet(doc, "Targeted Career Preparation", "Students can pinpoint exact missing skills and enroll in hands-on departmental clinics, transforming passive anxiety into proactive skill-building.")

    add_h2(doc, "7.4 SDG Contribution")
    add_para(doc, "The project concretely advances United Nations Sustainable Development Goals:")
    add_bullet(doc, "SDG 4 (Target 4.4)", "Directly bridges technical skill deficits through hands-on practical clinics in Data Structures, Full-Stack Web Development, and Cloud infrastructure.")
    add_bullet(doc, "SDG 8 (Target 8.6)", "Reduces youth underemployment and recruitment drop-out rates by streamlining the academic-to-career pipeline.")
    add_bullet(doc, "SDG 10 (Target 10.3)", "Ensures equal opportunity by establishing transparent, explainable criteria and safe, retaliation-free reporting mechanisms.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 8: CONCLUSION AND FUTURE SCOPE
    # =========================================================================
    add_h1(doc, "CHAPTER 8: CONCLUSION AND FUTURE SCOPE")

    add_h2(doc, "8.1 Conclusion")
    add_para(doc, "The transition from collegiate education to the professional technology sector should be a celebration of academic growth, not an ordeal of anxiety and administrative alienation. Through our 3-day field study at Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, our team witnessed firsthand the profound challenges that undergraduate students face during campus placements.")
    add_para(doc, "Our primary survey of 200 students confirmed that 72.5% of candidates feel their placement needs are unmet or only partly met, driven by communication delays, training disconnects, and opaque selection criteria. In response, 'Skill Bridge' demonstrated that human-centered, transparent system design can restore trust and efficiency. By providing clear role separation, explainable skill matching, practical clinic enrollment, and anonymous grievance redressal, Skill Bridge offers a transformative model for collegiate career enablement.")

    add_h2(doc, "8.2 Key Findings")
    add_bullet(doc, "High Systemic Friction", "72.5% of students report unmet or partly met placement support under conventional collegiate setups.")
    add_bullet(doc, "Severe Notice Lag", "Informal message forwards result in an average notice lag of 36 hours, causing 71% of surveyed students to miss or scramble during critical assessment windows.")
    add_bullet(doc, "Demand for Explainable Matching", "Students reject opaque percentage scores, demanding itemized breakdowns of matching and missing skills to direct their preparation.")
    add_bullet(doc, "Crucial Role of Anonymity", "Anonymity on grievance channels is essential to overcome the pervasive fear of institutional retaliation.")

    add_h2(doc, "8.3 Recommendations for Institutions")
    add_bullet(doc, "Abolish Informal Chat Forwarding", "Colleges must transition immediately to centralized, authoritative digital placement notice boards with push notifications.")
    add_bullet(doc, "Replace Aptitude-Only Training", "Curriculums must be supplemented with mandatory, credit-bearing machine coding clinics, Git collaboration, and modern framework workshops.")
    add_bullet(doc, "Adopt Explainable Evaluation", "Placement offices must require recruiters to specify concrete technical stack prerequisites rather than relying solely on blunt CGPA cutoffs.")
    add_bullet(doc, "Institutionalize Anonymous Grievance Redressal", "Establish protected student feedback channels to resolve scheduling clashes without penalizing candidates.")

    add_h2(doc, "8.4 Future Enhancements")
    add_bullet(doc, "Alumni Mentorship Networks", "Integrate verified alumni mentor networks to conduct 1-on-1 mock technical interviews and resume code reviews.")
    add_bullet(doc, "Multi-College Regional Consortium", "Expand the platform into a shared inter-collegiate pool across Mumbai suburban colleges to broaden company access for smaller institutions.")
    add_bullet(doc, "Longitudinal Career Tracking", "Incorporate multi-year graduate employment tracking to measure the long-term career progression of students participating in practical clinics.")

    add_page_break(doc)

    # =========================================================================
    # REFERENCES
    # =========================================================================
    add_h1(doc, "REFERENCES (MLA FORMAT)")

    refs = [
        "All India Council for Technical Education (AICTE). Model Curriculum for Undergraduate Degree Courses in Engineering & Technology. AICTE Publications, New Delhi, 2022.",
        "Aspiring Minds. National Employability Report: Engineers 2019. Aspiring Minds Research Cell, Gurugram, 2019.",
        "Banerjee, Abhijit, and Esther Duflo. Poor Economics: A Radical Rethinking of the Way to Fight Global Poverty. PublicAffairs, 2011.",
        "Guru Nanak Khalsa College of Arts, Science & Commerce. Departmental Placement Circulars, Notice Records, and Laboratory Audit Logs. Matunga, Mumbai, Sept. 2026.",
        "Nielsen, Jakob. Usability Engineering. Morgan Kaufmann Publishers, San Francisco, 1993.",
        "Pressman, Roger S., and Bruce R. Maxim. Software Engineering: A Practitioner's Approach. 9th ed., McGraw-Hill Education, New York, 2020.",
        "United Nations. The 2030 Agenda for Sustainable Development: Transforming Our World. United Nations Department of Economic and Social Affairs, New York, 2015.",
        "World Economic Forum. The Future of Jobs Report 2023. World Economic Forum, Geneva, Switzerland, 2023."
    ]
    for r in refs:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.left_indent = Inches(0.5)
        p_ref.paragraph_format.first_line_indent = Inches(-0.5)
        p_ref.paragraph_format.space_after = Pt(6)
        run = p_ref.add_run(r)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(10.5)

    add_page_break(doc)

    # =========================================================================
    # ANNEXURES
    # =========================================================================
    add_h1(doc, "ANNEXURES")

    add_h2(doc, "ANNEXURE A: FIELD VISIT PHOTOGRAPHS")
    add_para(doc, "Photographic documentary evidence recorded during the three community engagement field visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai:")

    add_callout_box(
        doc,
        "Photo A.1: Visit 1 — Community Immersion & Needs Assessment Session",
        "Team members Dhiraj Tendulkar (Leader), Vidhi Mahato, Gaurav Mhatre, and Varun Patil conducting focus group discussions with final-year CS & IT students in the Computing Laboratory at Khalsa College, Matunga (12 September 2026).",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Photo A.2: Visit 2 — Interactive Usability Testing in Central Computing Lab",
        "Students executing hands-on scenario testing of the Skill Bridge prototype on desktop terminals in CCF Lab 3 while team facilitators observe task completion and log interface suggestions (19 September 2026).",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Photo A.3: Visit 3 — Final Prototype Evaluation & Institutional Handover",
        "Final joint evaluation session in Seminar Hall 2 with Khalsa College student representatives and faculty placement coordinators, presenting the refined itemized skill matching breakdown and 6-dimension action plan (26 September 2026).",
        placeholder="(add picture)"
    )

    add_page_break(doc)

    add_h2(doc, "ANNEXURE B: SURVEY QUESTIONNAIRE (GOOGLE FORM)")
    add_para(doc, "The structured 12-question questionnaire circulated manually via Google Form to 200 undergraduate students at Guru Nanak Khalsa College:")

    q_items = [
        ("Q1", "Which department or course are you studying in?", "Select: Computer Science (CS) / Information Technology (IT) / Data Science (DS)"),
        ("Q2", "What is your current year of study?", "Select: First / Second / Third / Fourth / Other"),
        ("Q3", "What job role or career domain are you mainly interested in?", "Short text (e.g., Software Engineer, Full Stack Developer, Data Analyst)"),
        ("Q4", "How many campus recruitment drives offered roles relevant to your preferred domain during the current academic year?", "Select: 0 / 1–2 / 3 or more / Not sure"),
        ("Q5", "Is the placement cell currently meeting your placement-related needs?", "Select: Yes / Partly / No / Not enough experience to judge"),
        ("Q6", "How often do you receive placement information early enough to prepare and apply?", "Select: Always / Often / Sometimes / Rarely / Never"),
        ("Q7", "How useful was the college-arranged placement/training support in preparing you for assessments?", "Select: Very useful / Somewhat useful / Not useful / Have not attended"),
        ("Q8", "What is the single biggest barrier you face in getting placed?", "Select: Lack of technical skills / Eligibility cutoffs (CGPA) / Short notice / Few domain drives / Interview fear"),
        ("Q9", "What kind of support do you most urgently need from the college right now?", "Select: Coding/DSA workshops / Mock interviews / Timely circulars / Lower CGPA criteria"),
        ("Q10", "How satisfied are you with the overall campus placement process so far?", "Select: Very satisfied / Satisfied / Neutral / Dissatisfied / Very dissatisfied"),
        ("Q11", "Have you missed any placement drive or test deadline due to late information?", "Select: Yes / No"),
        ("Q12", "What specific change would make the placement cell significantly more helpful for your career?", "Paragraph text: Qualitative suggestions and student feedback")
    ]
    for q_id, q_text, q_opt in q_items:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_after = Pt(4)
        rq1 = p_q.add_run(f"{q_id}: {q_text}\n")
        rq1.font.bold = True
        rq1.font.size = Pt(10.5)
        rq2 = p_q.add_run(f"Options / Input: {q_opt}\n")
        rq2.font.italic = True
        rq2.font.size = Pt(10)
        rq2.font.color.rgb = RGBColor(71, 85, 105)

    add_page_break(doc)

    add_h2(doc, "ANNEXURE C: INTERVIEW & FOCUS GROUP DISCUSSION PROMPTS")
    add_para(doc, "Qualitative interview prompts utilized during student and faculty focus groups across Visits 1, 2, and 3:")
    add_bullet(doc, "Student Prompt 1", "Describe the last time you received a campus placement notification. How much time elapsed between the message and the actual online test?")
    add_bullet(doc, "Student Prompt 2", "When a company rejects your application or you are disqualified at the shortlisting stage, do you receive any explanation of what skills you were missing?")
    add_bullet(doc, "Student Prompt 3", "If you experience a scheduling conflict or technical glitch during a test, how comfortable are you approaching your placement coordinators to resolve it?")
    add_bullet(doc, "Coordinator Prompt 1", "What are the biggest operational bottlenecks your office faces when coordinating between visiting corporate HRs and hundreds of student applicants?")
    add_bullet(doc, "Coordinator Prompt 2", "What specific capabilities do recruiters tell you students are lacking when they fail technical interview rounds?")

    add_page_break(doc)

    add_h2(doc, "ANNEXURE D: REPORTING OFFICER / MENTOR FEEDBACK FORM")
    add_para(doc, "Blank feedback template for evaluation and sign-off by Industry / Field Reporting Officer and Faculty Mentor:")

    add_callout_box(
        doc,
        "Annexure D: Field Reporting Officer & Mentor Evaluation Sheet",
        "Institutional evaluation form recording marks for punctuality, community rapport, data integrity, problem-solving, and final report quality. Signed by Field Reporting Officer at Guru Nanak Khalsa College and Project Mentor at VSIT.",
        placeholder="(add picture)"
    )

    add_page_break(doc)

    add_h2(doc, "ANNEXURE E: SOURCE CODE REPOSITORY LINK & PROJECT CONTENTS")
    add_para(doc, "The complete source code repository, documentation, test suites, and database scripts for the Skill Bridge community portal are archived as follows:")
    add_bullet(doc, "Repository URL", "https://github.com/dhiraj-tendulkar/skill-bridge-cep-portal (Local workspace: D:\\CEP website)")
    add_bullet(doc, "Repository Contents", "Full React/TypeScript frontend source, Express backend API services, SQLite database schema and migration scripts, 157-point automated verification suites, and comprehensive documentation.")

    add_page_break(doc)

    add_h2(doc, "ANNEXURE F: USER MANUAL & WORKFLOW GUIDE")
    add_para(doc, "Operational instructions for students and placement coordinators:")
    add_bullet(doc, "Student Quick Start", "1. Access the portal URL; 2. Update your Academic & Skill Profile with branch, CGPA, and technical competencies; 3. Browse active circulars; 4. Review itemized skill match scores; 5. Apply or enroll in prerequisite workshop clinics; 6. Use the Feedback desk to submit confidential tickets.")
    add_bullet(doc, "Coordinator Quick Start", "1. Sign in with administrative credentials; 2. Post new recruitment vacancies with clear skill tags and assessment deadlines; 3. Inspect applicants filtered by branch; 4. Update applicant progress with feedback; 5. Audit workshop clinic attendance; 6. Review and resolve anonymous student grievances.")

    out_path = os.path.join(os.getcwd(), "CEP_Documentation_Dhiraj_Tendulkar_24302A0004.docx")
    doc.save(out_path)
    print(f"Dhiraj Tendulkar documentation built successfully: {out_path}")

if __name__ == "__main__":
    build_dhiraj_documentation()
