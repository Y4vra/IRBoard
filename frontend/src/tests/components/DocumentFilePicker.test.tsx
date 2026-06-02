import { DocumentFilePicker } from "@/components/DocumentFilePicker";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("DocumentFilePicker", () => {
  const onFileChange = vi.fn();

  const renderPicker = (
    file: File | null = null,
    accentColor: "blue" | "amber" = "blue"
  ) =>
    render(
      <DocumentFilePicker
        file={file}
        onFileChange={onFileChange}
        accentColor={accentColor}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no file is selected", () => {
    renderPicker();

    expect(
      screen.getByText(/click or drag & drop a file/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/any file type accepted/i)
    ).toBeInTheDocument();
  });

  it("renders selected file information", () => {
    const file = new File(["hello"], "test.pdf", {
      type: "application/pdf",
    });

    renderPicker(file);

    expect(screen.getByText("test.pdf")).toBeInTheDocument();

    expect(
      screen.getByText(/application\/pdf/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText("Change file")
    ).toBeInTheDocument();
  });

  it("calls onFileChange when a file is selected", () => {
    renderPicker();

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(["content"], "document.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(onFileChange).toHaveBeenCalledWith(file);
  });

  it("calls onFileChange when a file is dropped", () => {
    renderPicker();

    const dropZone = screen
      .getByRole("button")
      .closest("div") as HTMLElement;

    const file = new File(["content"], "dropped.pdf", {
      type: "application/pdf",
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(onFileChange).toHaveBeenCalledWith(file);
  });

  it("clears file when change file button is clicked", async () => {
    const user = userEvent.setup();

    const file = new File(["hello"], "test.pdf", {
      type: "application/pdf",
    });

    renderPicker(file);

    await user.click(
      screen.getByText("Change file")
    );

    expect(onFileChange).toHaveBeenCalledWith(null);
  });

  it("opens file picker when enter is pressed", () => {
    renderPicker();

    const clickable = screen.getByRole("button");
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const clickSpy = vi.spyOn(input, "click");

    fireEvent.keyDown(clickable, {
      key: "Enter",
    });

    expect(clickSpy).toHaveBeenCalled();
  });

  it("opens file picker when space is pressed", () => {
    renderPicker();

    const clickable = screen.getByRole("button");
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const clickSpy = vi.spyOn(input, "click");

    fireEvent.keyDown(clickable, {
      key: " ",
    });

    expect(clickSpy).toHaveBeenCalled();
  });

  it("formats KB file sizes correctly", () => {
    const file = new File(
      [new Uint8Array(2048)],
      "large.txt",
      { type: "text/plain" }
    );

    renderPicker(file);

    expect(screen.getByText(/2\.0 kb/i)).toBeInTheDocument();
  });

  it("formats MB file sizes correctly", () => {
    const file = new File(
      [new Uint8Array(2 * 1024 * 1024)],
      "huge.txt",
      { type: "text/plain" }
    );

    renderPicker(file);

    expect(screen.getByText(/2\.0 mb/i)).toBeInTheDocument();
  });

  it("renders amber styling variant with selected file", () => {
    const file = new File(["hello"], "test.pdf", {
      type: "application/pdf",
    });

    renderPicker(file, "amber");

    expect(screen.getByText("test.pdf")).toBeInTheDocument();
  });
});