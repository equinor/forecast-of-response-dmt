import os
import json
from glob import glob
def check():
    APPLICATIONS_HOME = "home"
    app_folders = [ f.path for f in os.scandir(APPLICATIONS_HOME) if f.is_dir() ]
    repositories = {}
    for folder in app_folders:

        try:
            data_sources = glob(f"{folder}/data_sources/*.json")
            for data_source in data_sources:
                with open(data_source) as json_file:
                    data_source_name = data_source.split("/")[-1].replace(".json", "")
                    repositories[data_source_name]= json.load(json_file)["repositories"]
                    # for repository in repositories:
                    #
                    #     if repositories[repository]["host"] == "db":
                    #         print(f"The data source {data_source} uses a local database to store data. For deployment, please do not use a local database")
                    #
                    #         # raise AssertionError()

        except FileNotFoundError:
            raise FileNotFoundError("file could not be found")
        except AssertionError:
            raise AssertionError(f"The data source {data_source} uses a local database to store data. For deployment, please do not use a local database")
    # print("ALL REPOS", repositories)

    for folder in app_folders:
        with open(f"{folder}/settings.json") as json_file:
            settings = json.load(json_file)
            packages = settings["packages"]
            for package in packages:
                data_source = package.split("/")[0]
                print("data_source", data_source)
                print("repositories", repositories)
                print("repositories[data_source]", repositories[data_source])
                if repositories[data_source]["host"] == "db":
                    print("FOUND A LOCAL DATABASE HOST")
            #todo handle alias


# check()


