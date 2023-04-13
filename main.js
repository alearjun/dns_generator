document.getElementById("domain-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const keywords = document.getElementById("keywords").value;
    try {
      const response = await fetch(`/api/generate-domains?keywords=${encodeURIComponent(keywords)}`);
      if (!response.ok) {
        throw new Error("An error occurred while fetching domain data.");
      }
      const data = await response.json();
      console.log(data);
      
      const tbody = document.getElementById("domain-table").querySelector("tbody");
      tbody.innerHTML = "";
      data.domains.forEach(domain => {
        const tr = document.createElement("tr");
        const tdDomain = document.createElement("td");
        tdDomain.textContent = domain.name;
        const tdStatus = document.createElement("td");
        tdStatus.innerHTML = domain.available ? "✅" : "❌";
        tr.append(tdDomain, tdStatus);
        tbody.append(tr);
      });
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again later.");
    }
  });
  