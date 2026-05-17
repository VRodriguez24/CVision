export function FormPanel({ value, onChange }) {
    const setField = (key) => (e) => {
        onChange((prev) => ({ ...prev, [key]: e.target.value }));
    };

    return (
        <div className="p-4 space-y-3">
            <h2 className="text-lg font-semibold">CV Form</h2>

            <input
                className="w-full border rounded px-3 py-2"
                placeholder="Name"
                value={value.name || ""}
                onChange={setField("name")}
            />

            <input
                className="w-full border rounded px-3 py-2"
                placeholder="Headline"
                value={value.headline || ""}
                onChange={setField("headline")}
            />

            <input
                className="w-full border rounded px-3 py-2"
                placeholder="Email"
                value={value.email || ""}
                onChange={setField("email")}
            />

            <textarea
                className="w-full border rounded px-3 py-2"
                placeholder="Experience highlights (one per line)"
                value={value.experience_highlights || ""}
                onChange={setField("experience_highlights")}
                rows={4}
            />
        </div>
    );
}