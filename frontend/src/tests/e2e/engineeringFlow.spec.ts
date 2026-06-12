import { test, expect, type Page } from '@playwright/test';
import { login } from './authentication.spec';

const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL ?? (() => { throw new Error('INITIAL_ADMIN_EMAIL is not set') })();
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD ?? (() => { throw new Error('INITIAL_ADMIN_PASSWORD is not set') })();

export async function loggedInUserCreateProject(page:Page,projectName:string,projectDescription:string,projectStakeholder:string) {
    await page.goto("/home");
    await expect(page.getByTestId("home_header")).toBeVisible();
    
    await page.getByTestId('create_project_link').click();
    
    await page.waitForURL(/\/projects\/new\/?$/);

    await page.getByPlaceholder("e.g. IR-Board System")
    .fill(projectName);

    await page.getByPlaceholder("e.g. University of Oviedo")
        .fill(projectStakeholder);

    await page.getByPlaceholder(
        "Provide a brief overview of the project's scope..."
    ).fill(projectDescription);

    await page.getByRole("button", {
        name: "Initialize Project",
    }).click();

    await page.waitForURL("/home");
    await expect(page.getByTestId("home_header")).toBeVisible();
}

export async function accessAvailableProjectFromHomeView(page:Page,projectName:string) {
    await page.goto("/home");
    await expect(page.getByTestId("home_header")).toBeVisible();
    
    await page.getByTestId("more_link_"+projectName).click();

    await expect(page.getByTestId("project_header_"+projectName)).toBeVisible();
}

export async function accessRemovedProject(page: Page, projectName: string) {

    await page.goto("/home");
  await expect(page.getByTestId("home_header")).toBeVisible();

  await page.getByTestId("view_toggle_removed").click();

  await expect(
    page.getByText("Removed projects archive")
  ).toBeVisible();

  const projectLink = page.getByTestId("more_link_" + projectName);

  await expect(projectLink).toBeVisible();
  await projectLink.click();

  await expect(
    page.getByTestId("project_header_" + projectName)
  ).toBeVisible();
}
export async function accessRemovedElementFromElementView(page: Page, elementName: string,pageHeaderDataTestId:string,elementViewHeaderDataTestId:string,elementHeaderDataTestIdSuffix:string) {
    await expect(page.getByTestId(elementViewHeaderDataTestId)).toBeVisible();

    await page.getByTestId("view_toggle_removed").click();

    const projectLink = page.getByTestId(elementHeaderDataTestIdSuffix + elementName);

    await expect(projectLink).toBeVisible();
    await projectLink.click();

    await expect(page.getByTestId(pageHeaderDataTestId)).toBeVisible();
}
export async function accessAvailableElementFromElementView(page: Page, elementName: string,pageHeaderDataTestId:string,elementViewHeaderDataTestId:string,elementHeaderDataTestIdSuffix:string) {
    await expect(page.getByTestId(elementViewHeaderDataTestId)).toBeVisible();

    const projectLink = page.getByTestId(elementHeaderDataTestIdSuffix + elementName);

    await expect(projectLink).toBeVisible();
    await projectLink.click();

    await expect(page.getByTestId(pageHeaderDataTestId)).toBeVisible();
}

export async function accessAvailableFunctionalityFromProjectView(page:Page,projectName:string,functionalityName:string){
    await expect(page.getByTestId("project_header_"+projectName)).toBeVisible();

    await page.getByTestId(`functionality_link_${functionalityName}`).click();

    await expect(page.getByTestId("functionality_view_header")).toBeVisible();
}

export async function accessStakeholderViewFromProjectView(page:Page){
    await page.getByTestId("stakeholders_link").click();   
    await page.waitForURL(/\/stakeholders\/?$/);
    await expect(page.getByTestId("stakeholder_view_header")).toBeVisible();
}

export async function accessNfrViewFromProjectView(page:Page){
    await page.getByTestId("nfrs_link").click();
    await page.waitForURL(/\/nfr\/?$/);
    await expect(page.getByTestId("nfr_view_header")).toBeVisible();
}

export async function accessDocumentViewFromProjectView(page:Page){
    await page.getByTestId("documents_link").click();
    await page.waitForURL(/\/documents\/?$/);
    await expect(page.getByTestId("document_view_header")).toBeVisible();
}

export async function disableProject(page:Page) {
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Disable project" }).click();
}

export async function removeProject(page:Page) {
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Remove project" }).click();

    await page.getByTestId("confirmButton").click();
}
export async function deleteProject(page:Page) {
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Delete permanently" }).click();

    await page.getByTestId("confirmButton").click();
}

export async function disableProjectElement(page: Page) {
  await page.getByTestId("disable_project_element").click();
}

export async function removeProjectElement(page: Page) {
  await page.getByTestId("remove_project_element").click();
  await page.getByTestId("confirmButton").click();
}

export async function deleteProjectElement(page: Page) {
  await page.getByTestId("delete_project_element").click();
  await page.getByTestId("confirmButton").click();
}

export async function deleteProjectFromHomeView(page:Page,projectName:string) {
    await accessAvailableProjectFromHomeView(page,projectName);
    await disableProject(page);
    await removeProject(page);

    await page.waitForURL("/home");
    await expect(page.getByTestId("home_header")).toBeVisible();

    await accessRemovedProject(page,projectName);
    await deleteProject(page);
}
export async function deleteProjectElementFromElementsView(page:Page,elementName:string,pageHeaderDataTestId:string,elementViewHeaderDataTestId:string,elementHeaderDataTestIdSuffix:string){
    await accessAvailableElementFromElementView(page,elementName,pageHeaderDataTestId,elementViewHeaderDataTestId,elementHeaderDataTestIdSuffix);

    await disableProjectElement(page);
    await removeProjectElement(page);

    await expect(page.getByTestId(elementViewHeaderDataTestId)).toBeVisible();

    await accessRemovedElementFromElementView(page,elementName,pageHeaderDataTestId,elementViewHeaderDataTestId,elementHeaderDataTestIdSuffix);
    await deleteProjectElement(page);
}

export async function generateStakeholderFromProjectView(page:Page,projectName:string,stakeholderName:string,stakeholderDescription:string) {
    await accessStakeholderViewFromProjectView(page);

    await page.getByTestId("create_stakeholder_button_open_dialog").click();

    await page
        .getByLabel("Stakeholder Name")
        .fill(stakeholderName);

    await page
        .getByLabel("Description")
        .fill(
        stakeholderDescription
        );

    await page
        .getByRole("button", { name: "Register" })
        .click();

    await expect(
        page.getByRole("dialog")
        ).not.toBeVisible();

    await page.waitForURL(/\/stakeholders\/?$/);

    await expect(page.getByTestId("stakeholder_"+stakeholderName)).toBeVisible();

    await page.getByRole("link", { name: "Back to Project" }).click();

    await expect(page.getByTestId("project_header_"+projectName)).toBeVisible();
}

export async function generateNfrFromProjectView(page:Page, 
        projectName:string,
        nfrName: string,
        nfrDescription: string,
        measurementUnit: string = "ms",
        thresholdValue: string = "100",
        targetValue: string = "50",
        actualValue: string = "0"
    ) {
    await accessNfrViewFromProjectView(page);

    await page.getByTestId("create_nfr_button_open_dialog").click();

    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel("Name").fill(nfrName);

    await page.getByLabel("Description").fill(nfrDescription);

    await page.getByLabel("Measurement Unit").fill(measurementUnit);

    await page.getByRole("combobox").click();
    
    await page.getByRole("option", {
        name: ">= Greater than or equal"
    }).click();

    await page.getByLabel("Threshold").fill(thresholdValue);

    await page.getByLabel("Target").fill(targetValue);

    await page.getByLabel("Actual").fill(actualValue);

    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();

    await page.waitForURL(/\/nfr\/?$/);

    await expect(page.getByTestId("nfr_"+nfrName)).toBeVisible();
    
    await page.getByRole("link", { name: "Back to Project" }).click();

    await expect(page.getByTestId("project_header_"+projectName)).toBeVisible();
}

export async function generateDocumentFromProjectView(
    page: Page,
    projectName:string,
    fileName: string
) {
    await accessDocumentViewFromProjectView(page);

    await page.getByRole("button", { name: "Upload Document" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    
    await page.locator("#document-file-input").setInputFiles({
        name: fileName,
        mimeType: "text/plain",
        buffer: Buffer.from("Hello from Playwright"),
    });

    await page.getByRole("button", { name: "Upload" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();

    await expect(
        page.getByTestId(`document_${fileName}`)
    ).toBeVisible();

    await page.getByRole("link", { name: "Back to Project" }).click();

    await expect(page.getByTestId("project_header_"+projectName)).toBeVisible();
}

export async function generateFunctionalityFromProjectView(
    page: Page,
    projectName:string,
    functionalityName: string,
    functionalityDescription: string,
    functionalityLabel?: string
) {
    await expect(page.getByTestId("project_header_"+projectName)).toBeVisible();

    await page.getByTestId("generate_functionality").first().click();

    await expect(page.getByRole("dialog")).toBeVisible();

    await page
        .getByLabel("Functionality Name")
        .fill(functionalityName);

    if (functionalityLabel) {
        await page
            .getByLabel("Label")
            .fill(functionalityLabel);
    }

    await page
        .getByLabel("Description")
        .fill(functionalityDescription);

    await page
        .getByRole("button", { name: "Create" })
        .click();

    await expect(
        page.getByRole("dialog")
    ).not.toBeVisible();

    await accessAvailableFunctionalityFromProjectView(page,projectName,functionalityName);

    await page.getByRole("link", { name: "Back to Project" }).click();

    await expect(page.getByTestId("project_header_"+projectName)).toBeVisible();
}

export async function generateFunctionalRequirementFromFunctionalityView(
    page: Page,
    frName: string,
    frDescription: string,
    priority: string = "MUST",
    stability: string = "UNSTABLE"
) {
    await expect(
        page.getByTestId("functionality_view_header")
    ).toBeVisible();

    await page.getByTestId("generate_fr").click();

    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel(/Name/i).fill(frName);

    await page.getByLabel(/Description/i).fill(frDescription);

    // Priority
    await page.getByRole("combobox").nth(0).click();

    await page.getByRole("option", {
        name: priority,
    }).click();

    // Stability
    await page.getByRole("combobox").nth(1).click();

    await page.getByRole("option", {
        name: stability,
    }).click();

    await page.getByRole("button", {
        name: "Create",
    }).click();

    await expect(
        page.getByRole("dialog")
    ).not.toBeVisible();

    await expect(
        page.getByTestId(`functional_requirement_${frName}`)
    ).toBeVisible();
}

test.describe("Expected requirement engineering flow", () => {
    test("Creates project for the first time and deletes it", async ({ page }) => {
        await login(page,ADMIN_EMAIL,ADMIN_PASSWORD);

        const projectName = `test-${Date.now()}`;

        await loggedInUserCreateProject(page,projectName,"Project automatically created by Playwright E2E tests.","OpenAI Testing");

        await deleteProjectFromHomeView(page,projectName);
    })

    test("Creates a project and does stakeholder management", async ({ page }) => {
        await login(page,ADMIN_EMAIL,ADMIN_PASSWORD);

        const projectName = `test-${Date.now()}`;
        const elementName = `test_Project_manager_${Date.now()}`;
        const pageHeaderDataTestId = "stakeholder_detail_header";
        const elementViewHeaderDataTestId = "stakeholder_view_header";
        const elementHeaderDataTestIdSuffix = "stakeholder_";

        await loggedInUserCreateProject(page,projectName,"Project automatically created by Playwright E2E tests.","OpenAI Testing");

        await accessAvailableProjectFromHomeView(page,projectName);
        
        await generateStakeholderFromProjectView(page,projectName,elementName,"Responsible for coordinating stakeholders and validating requirements.");

        await accessStakeholderViewFromProjectView(page);

        await deleteProjectElementFromElementsView(page,elementName,pageHeaderDataTestId,elementViewHeaderDataTestId,elementHeaderDataTestIdSuffix);

        await deleteProjectFromHomeView(page,projectName);
    });

    test("Creates a project and does nfr management", async ({ page }) => {
        await login(page,ADMIN_EMAIL,ADMIN_PASSWORD);

        const projectName = `test-${Date.now()}`;
        const elementName = `test_Nfr_test_name_${Date.now()}`;
        const pageHeaderDataTestId = "nfr_detail_header";
        const elementViewHeaderDataTestId = "nfr_view_header";
        const elementHeaderDataTestIdSuffix = "nfr_";

        await loggedInUserCreateProject(page,projectName,"Project automatically created by Playwright E2E tests.","OpenAI Testing");

        await accessAvailableProjectFromHomeView(page,projectName);

        await generateNfrFromProjectView(page,projectName,elementName,"description_for_nfr","example_measurement_unit","1.0","1.0","1.0");

        await accessNfrViewFromProjectView(page);

        await deleteProjectElementFromElementsView(page,elementName,pageHeaderDataTestId,elementViewHeaderDataTestId,elementHeaderDataTestIdSuffix);

        await deleteProjectFromHomeView(page,projectName);
    });

    test("Creates a project and does document management", async ({ page }) => {
        await login(page,ADMIN_EMAIL,ADMIN_PASSWORD);

        const projectName = `test-${Date.now()}`;
        const elementName = `sample.txt_${Date.now()}`;
        const pageHeaderDataTestId = "document_detail_header";
        const elementViewHeaderDataTestId = "document_view_header";
        const elementHeaderDataTestIdSuffix = "document_";

        await loggedInUserCreateProject(page,projectName,"Project automatically created by Playwright E2E tests.","OpenAI Testing");

        await accessAvailableProjectFromHomeView(page,projectName);
        
        await generateDocumentFromProjectView(page,projectName,elementName)

        await accessDocumentViewFromProjectView(page);

        await deleteProjectElementFromElementsView(page,elementName,pageHeaderDataTestId,elementViewHeaderDataTestId,elementHeaderDataTestIdSuffix);

        await deleteProjectFromHomeView(page,projectName);
    });

    test("Creates a project and does functionality management", async ({ page }) => {
        await login(page,ADMIN_EMAIL,ADMIN_PASSWORD);

        const projectName = `test-${Date.now()}`;
        const functionalityName = `test_funct_${Date.now()}`;

        await loggedInUserCreateProject(page,projectName,"Project automatically created by Playwright E2E tests.","OpenAI Testing");

        await accessAvailableProjectFromHomeView(page,projectName);
        
        await generateFunctionalityFromProjectView(page,projectName,functionalityName,"test_description","TF");
        
        await deleteProjectFromHomeView(page,projectName);
    });

    test("Creates a project and does functional requirement management", async ({ page }) => {
        await login(page,ADMIN_EMAIL,ADMIN_PASSWORD);

        const projectName = `test-${Date.now()}`;
        const functionalityName = `test_funct_${Date.now()}`;
        const elementName = `fr_${Date.now()}`;
        const pageHeaderDataTestId = "functional_requirement_detail_header";
        const elementViewHeaderDataTestId = "functionality_view_header";
        const elementHeaderDataTestIdSuffix = "functional_requirement_";

        await loggedInUserCreateProject(page,projectName,"Project automatically created by Playwright E2E tests.","OpenAI Testing");

        await accessAvailableProjectFromHomeView(page,projectName);
        
        await generateFunctionalityFromProjectView(page,projectName,functionalityName,"test_description","TF");
        
        await accessAvailableFunctionalityFromProjectView(page,projectName,functionalityName);

        await generateFunctionalRequirementFromFunctionalityView(page,elementName,"test_description","HIGH","UNSTABLE");

        await deleteProjectElementFromElementsView(page,elementName,pageHeaderDataTestId,elementViewHeaderDataTestId,elementHeaderDataTestIdSuffix);

        await deleteProjectFromHomeView(page,projectName);
    });
})