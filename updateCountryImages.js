// Update script - Add images to existing countries
const API = "http://localhost:5000";

const countryImages = {
    "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800&auto=format&fit=crop",
    "Malaysia": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800&auto=format&fit=crop",
    "Thailand": "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=800&auto=format&fit=crop",
    "India": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop",
    "United Arab Emirates": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop",
    "Saudi Arabia": "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?q=80&w=800&auto=format&fit=crop",
    "Turkey": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=800&auto=format&fit=crop",
    "United Kingdom": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop",
    "United States": "https://images.unsplash.com/photo-1485738422979-f5c462d49f04?q=80&w=800&auto=format&fit=crop",
    "Canada": "https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=800&auto=format&fit=crop",
    "Japan": "https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=800&auto=format&fit=crop",
    "South Korea": "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=800&auto=format&fit=crop",
    "Qatar": "https://images.unsplash.com/photo-1559564484-e48b3e040ff4?q=80&w=800&auto=format&fit=crop",
    "Oman": "https://images.unsplash.com/photo-1597220869819-b71a3da8d595?q=80&w=800&auto=format&fit=crop",
    "Australia": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=800&auto=format&fit=crop",
    "China": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=800&auto=format&fit=crop",
    "Vietnam": "https://images.unsplash.com/photo-1557750255-c76072a7aad1?q=80&w=800&auto=format&fit=crop",
    "Indonesia": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop",
    "Sri Lanka": "https://images.unsplash.com/photo-1586003903385-28a5c81d84d0?q=80&w=800&auto=format&fit=crop",
    "Maldives": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop",
    "France": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
    "Germany": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop",
    "Italy": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop",
    "Spain": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=800&auto=format&fit=crop",
    "Switzerland": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop",
    "Netherlands": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=800&auto=format&fit=crop",
    "Kuwait": "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=800&auto=format&fit=crop",
    "Bahrain": "https://images.unsplash.com/photo-1580698087168-3662f810c4d6?q=80&w=800&auto=format&fit=crop",
    "New Zealand": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?q=80&w=800&auto=format&fit=crop",
    "Egypt": "https://images.unsplash.com/photo-1539768942893-daf53e736b68?q=80&w=800&auto=format&fit=crop",
};

async function updateImages() {
    // Login first
    console.log("🔐 Logging in...");
    let token;
    try {
        const loginRes = await fetch(`${API}/api/auth/login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@gmail.com", password: "admin@gmail.com" })
        });
        const loginData = await loginRes.json();
        token = loginData?.data?.tokens?.accessToken || loginData?.data?.token || loginData?.token;
        if (!token) { console.log("❌ Login failed:", JSON.stringify(loginData)); return; }
        console.log("✅ Logged in!\n");
    } catch (e) { console.log("❌ Login error:", e.message); return; }

    // Get all countries
    console.log("📦 Fetching countries...");
    const res = await fetch(`${API}/api/countries`);
    const data = await res.json();
    const countries = data.data || data;

    if (!Array.isArray(countries)) {
        console.log("❌ Could not get countries list");
        return;
    }

    console.log(`Found ${countries.length} countries\n`);

    let ok = 0, fail = 0;
    for (const c of countries) {
        const image = countryImages[c.name];
        if (!image) {
            console.log(`  ⏭️ ${c.name} - no image mapping`);
            continue;
        }
        try {
            const updateRes = await fetch(`${API}/api/countries/${c._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ image })
            });
            const updateData = await updateRes.json();
            if (updateData.success) { ok++; console.log(`  ✅ ${c.name} - image added`); }
            else { fail++; console.log(`  ❌ ${c.name}: ${updateData.message}`); }
        } catch (e) { fail++; console.log(`  ❌ ${c.name}: ${e.message}`); }
    }
    console.log(`\n🎉 Done! ${ok} updated, ${fail} failed.\n`);
}

updateImages();
