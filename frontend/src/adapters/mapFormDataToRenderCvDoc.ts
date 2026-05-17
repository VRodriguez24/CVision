export function mapFormDataToRenderCvDoc(formData: any) {
    const highlights = (formData.experience_highlights || "")
        .split("\n")
        .map((s: any) => s.trim())
        .filter(Boolean);

    return {
        cv: {
            name: formData.name || "",
            headline: formData.headline || "",
            location: formData.location || "",
            email: formData.email || "",
            phone: formData.phone || "",
            website: formData.website || "",
            linkedin: formData.linkedin || "",
            github: formData.github || "",
            sections: {
                Experience: [
                    {
                        company: formData.experience_company || "",
                        position: formData.experience_position || "",
                        location: formData.experience_location || "",
                        date: formData.experience_date || "",
                        summary: formData.experience_summary || "",
                        highlights
                    }
                ],
                Education: [
                    {
                        institution: formData.education_institution || "",
                        area: formData.education_area || "",
                        degree: formData.education_degree || "",
                        location: formData.education_location || "",
                        date: formData.education_date || ""
                    }
                ],
                Skills: [
                    {
                        label: formData.skills_label || "Skills",
                        details: formData.skills_details || ""
                    }
                ]
            }
        },
        locale: {
            language: "english"
        },
        design: {
            theme: "mart"
        }
    };
}