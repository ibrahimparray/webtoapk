const API_BASE = import.meta.env.VITE_API_URL || "";

export interface BuildRequest {
  siteUrl: string;
  appName: string;
  packageName: string;
  icon?: File;
}

export async function submitBuild(
  request: BuildRequest,
  onLog: (message: string) => void,
  onSuccess: (downloadUrl: string) => void,
  onError: (message: string) => void
): Promise<void> {
  const formData = new FormData();
  formData.append("siteUrl", request.siteUrl);
  formData.append("appName", request.appName);
  formData.append("packageName", request.packageName);
  if (request.icon) {
    formData.append("icon", request.icon);
  }

  const response = await fetch(`${API_BASE}/api/build`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Build failed");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("No response stream available");
  }

  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));

        if (data.type === "log") {
          onLog(data.message);
        } else if (data.type === "success") {
          onSuccess(data.downloadUrl);
        } else if (data.type === "error") {
          onError(data.message);
        }
      }
    }
  }
}
